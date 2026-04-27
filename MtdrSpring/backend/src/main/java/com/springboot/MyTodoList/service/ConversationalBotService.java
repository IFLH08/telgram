package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.model.EstadoTarea;
import com.springboot.MyTodoList.model.Prioridad;
import com.springboot.MyTodoList.model.Rol;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.EstadoTareaRepository;
import com.springboot.MyTodoList.repository.PrioridadRepository;
import com.springboot.MyTodoList.repository.RolRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TareaRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.JsonExtractionHelper;
import com.springboot.MyTodoList.util.SessionManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import com.springboot.MyTodoList.util.BotLabels;

@Service
public class ConversationalBotService {

    private final TelegramClient telegramClient;
    @Autowired
    private final DeepSeekService deepSeekService;
    private final SessionManager sessionManager;
    private final JsonExtractionHelper jsonHelper;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstadoTareaRepository estadoTareaRepository;
    private final PrioridadRepository prioridadRepository;
    private final RolRepository rolRepository;
    private final SprintRepository sprintRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ConversationalBotService(TelegramClient telegramClient, DeepSeekService deepSeekService,
            SessionManager sessionManager, JsonExtractionHelper jsonHelper,
            TareaRepository tareaRepository, UsuarioRepository usuarioRepository,
            EstadoTareaRepository estadoTareaRepository, PrioridadRepository prioridadRepository,
            RolRepository rolRepository, SprintRepository sprintRepository) {
        this.telegramClient = telegramClient;
        this.deepSeekService = deepSeekService;
        this.sessionManager = sessionManager;
        this.jsonHelper = jsonHelper;
        this.tareaRepository = tareaRepository;
        this.usuarioRepository = usuarioRepository;
        this.estadoTareaRepository = estadoTareaRepository;
        this.prioridadRepository = prioridadRepository;
        this.rolRepository = rolRepository;
        this.sprintRepository = sprintRepository;
    }

    public void processMessage(Long chatId, String requestText) {
        SessionManager.UserSession session = sessionManager.getSession(chatId);

        if (session.getState() == SessionManager.State.WAITING_FOR_CONFIRMATION) {
            handleConfirmation(chatId, requestText, session);
            return;
        }

        if (session.getState() == SessionManager.State.WAITING_FOR_MISSING_DATA) {
            handleMissingData(chatId, requestText, session);
            return;
        }

        if (requestText.equalsIgnoreCase(BotLabels.SHOW_MAIN_SCREEN.getLabel()) || requestText.equals("/start")) {
            ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
                    .keyboardRow(
                            new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()))
                    .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(),
                            BotLabels.HIDE_MAIN_SCREEN.getLabel()))
                    .resizeKeyboard(true)
                    .build();
            BotHelper.sendMessageToTelegram(chatId,
                    "¡Hola! Soy tu asistente de proyectos. Usa '/AddTask [descripción y horas]' o usa los botones del menú de abajo.",
                    telegramClient, keyboardMarkup);
            return;
        }

        if (requestText.equalsIgnoreCase(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {
            BotHelper.sendMessageToTelegram(chatId, "Menú oculto. Escribe /start para volver a verlo.", telegramClient,
                    null);
            return;
        }

        if (requestText.equalsIgnoreCase(BotLabels.ADD_NEW_ITEM.getLabel())) {
            BotHelper.sendMessageToTelegram(chatId, "🤖 Escribe /AddTask seguido de tu instrucción.", telegramClient,
                    null);
            return;
        }

        if (requestText.equalsIgnoreCase(BotLabels.MY_TODO_LIST.getLabel())
                || requestText.equalsIgnoreCase(BotLabels.LIST_ALL_ITEMS.getLabel())) {
            handleListAllTareas(chatId);
            return;
        }

        if (requestText.contains("-INICIAR")) {
            handleMarcarIniciada(chatId, requestText);
            return;
        }

        if (requestText.contains("-TERMINAR")) {
            handleMarcarTerminada(chatId, requestText);
            return;
        }

        if (requestText.toLowerCase().startsWith("/addtask") || requestText.toLowerCase().startsWith("/additem")) {
            sessionManager.clearSession(chatId);
            session = sessionManager.getSession(chatId);
            startAddProcess(chatId, requestText, session);
            return;
        }

        BotHelper.sendMessageToTelegram(chatId,
                "🤖 Comando no reconocido. Escribe /AddTask seguido de tu instrucción o usa el menú enviando 'Show Main Screen'.",
                telegramClient, null);
    }

    private Usuario getOrCreateUser(Long chatId) {
        return usuarioRepository.findByTelegramId(chatId).orElseGet(() -> {
            try {
                Usuario newUser = new Usuario();
                newUser.setTelegramId(chatId);
                newUser.setNombre("Telegram User " + chatId);
                newUser.setUsername("tg_" + chatId);
                newUser.setFechaRegistro(OffsetDateTime.now());
                Rol rol = rolRepository.findByNombreRol("USER");
                if (rol == null) {
                    rol = new Rol();
                    rol.setNombreRol("USER");
                    rol = rolRepository.save(rol);
                }
                newUser.setRol(rol);
                return usuarioRepository.save(newUser);
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        });
    }

    private void handleListAllTareas(Long chatId) {
        try {
            Usuario user = getOrCreateUser(chatId);
            if (user == null) {
                BotHelper.sendMessageToTelegram(chatId,
                        "⚠️ Error de auto-registro en BD. Pide al admin que revise los logs.", telegramClient, null);
                return;
            }

            List<Tarea> allItems = tareaRepository.findByUsuarioAsignadoIdUsuario(user.getIdUsuario());

            ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
                    .resizeKeyboard(true)
                    .oneTimeKeyboard(false)
                    .selective(true)
                    .build();

            List<Tarea> activas = allItems.stream().filter(
                    t -> t.getEstado() != null && !t.getEstado().getNombreEstado().equalsIgnoreCase("COMPLETED"))
                    .collect(Collectors.toList());
            List<Tarea> terminadas = allItems.stream()
                    .filter(t -> t.getEstado() != null && t.getEstado().getNombreEstado().equalsIgnoreCase("COMPLETED"))
                    .collect(Collectors.toList());

            if (activas.isEmpty()) {
                BotHelper.sendMessageToTelegram(chatId, "No tienes tareas activas. Escribe /AddTask para crear una.",
                        telegramClient, null);
                return;
            }

            List<KeyboardRow> keyboard = new ArrayList<>();
            KeyboardRow topRow = new KeyboardRow();
            topRow.add(BotLabels.LIST_ALL_ITEMS.getLabel());
            topRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
            keyboard.add(topRow);

            for (Tarea item : activas) {
                KeyboardRow currentRow = new KeyboardRow();
                String nombre = item.getNombre() != null ? item.getNombre() : "Sin nombre";
                currentRow.add(
                        "ID: " + item.getIdTarea() + " - " + (nombre.length() > 20 ? nombre.substring(0, 20) : nombre));
                if (item.getEstado().getNombreEstado().equalsIgnoreCase("PENDING")) {
                    currentRow.add(item.getIdTarea() + "-INICIAR");
                } else if (item.getEstado().getNombreEstado().equalsIgnoreCase("IN PROGRESS")) {
                    currentRow.add(item.getIdTarea() + "-TERMINAR");
                }
                keyboard.add(currentRow);
            }

            KeyboardRow bottomRow = new KeyboardRow();
            bottomRow.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
            bottomRow.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
            keyboard.add(bottomRow);

            keyboardMarkup.setKeyboard(keyboard);

            BotHelper.sendMessageToTelegram(chatId, "Tus tareas activas (Usa los botones para gestionarlas):",
                    telegramClient, keyboardMarkup);
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "❌ Error interno al listar tareas: " + e.getMessage(),
                    telegramClient, null);
        }
    }

    private void handleMarcarIniciada(Long chatId, String requestText) {
        try {
            Long id = Long.parseLong(requestText.split("-")[0]);
            Tarea t = tareaRepository.findById(id).orElse(null);
            if (t == null) {
                BotHelper.sendMessageToTelegram(chatId, "⚠️ No se encontró la tarea con ID " + id + ".", telegramClient,
                        null);
                return;
            }
            EstadoTarea estado = estadoTareaRepository.findByNombreEstado("IN PROGRESS");
            if (estado == null) {
                estado = new EstadoTarea();
                estado.setNombreEstado("IN PROGRESS");
                estado = estadoTareaRepository.save(estado);
            }
            t.setEstado(estado);
            tareaRepository.save(t);
            BotHelper.sendMessageToTelegram(chatId, "🚀 Tarea " + id + " marcada como INICIADA.", telegramClient, null);
            handleListAllTareas(chatId);
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "❌ Error al iniciar tarea: " + e.getMessage(), telegramClient,
                    null);
        }
    }

    private void handleMarcarTerminada(Long chatId, String requestText) {
        try {
            Long id = Long.parseLong(requestText.split("-")[0]);
            Tarea t = tareaRepository.findById(id).orElse(null);
            if (t == null) {
                BotHelper.sendMessageToTelegram(chatId, "⚠️ No se encontró la tarea con ID " + id + ".", telegramClient,
                        null);
                return;
            }
            // Falta requerir las horas reales, por el momento pondremos las estimadas
            EstadoTarea estado = estadoTareaRepository.findByNombreEstado("COMPLETED");
            if (estado == null) {
                estado = new EstadoTarea();
                estado.setNombreEstado("COMPLETED");
                estado = estadoTareaRepository.save(estado);
            }
            t.setEstado(estado);
            t.setHorasReales(t.getHorasEstimadas()); // Temporal, el requerimiento pide interactuar y pedirlas.
            tareaRepository.save(t);
            BotHelper.sendMessageToTelegram(chatId, "✅ Tarea " + id + " marcada como TERMINADA.", telegramClient, null);
            handleListAllTareas(chatId);
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "❌ Error al terminar tarea: " + e.getMessage(), telegramClient,
                    null);
        }
    }

    private void startAddProcess(Long chatId, String requestText, SessionManager.UserSession session) {
        BotHelper.sendMessageToTelegram(chatId,
                "🧠 Procesando petición resumida y evaluando límites de tiempo (máx 4h según buenas prácticas)...",
                telegramClient, null);

        String prompt = "Resume esta tarea en formato JSON. Genera nombre, descripcion, horasEstimadas y idPrioridad (1 baja, 2 media, 3 alta). IMPORTANTE: La regla de Oracle indica que ninguna tarea debe tener un estimado mayor a 4 horas. Si el requerimiento excede las 4 horas, debes subdividir lógicamente la tarea en múltiples subtareas (cada una de máximo 4 horas). Debes devolver el resultado ESTRICTAMENTE como un ARREGLO JSON (incluso si es una sola tarea): [{\"nombre\": \"...\", \"descripcion\": \"...\", \"horasEstimadas\": X, \"idPrioridad\": Y}]. Responde puro JSON:\n"
                + requestText;
        String llmRawResponse = "";

        try {
            llmRawResponse = deepSeekService.generateText(prompt);
            String cleanedJson = jsonHelper.extractInternalContent(llmRawResponse);

            if (cleanedJson.equals("{}") || (!cleanedJson.trim().startsWith("["))) {
                int start = llmRawResponse.indexOf('[');
                int end = llmRawResponse.lastIndexOf(']');
                if (start != -1 && end != -1 && end > start) {
                    cleanedJson = llmRawResponse.substring(start, end + 1);
                } else {
                    cleanedJson = "[" + cleanedJson + "]";
                }
            }

            JsonNode jsonArray = objectMapper.readTree(cleanedJson);
            List<Tarea> draftTareas = new ArrayList<>();

            if (jsonArray.isArray()) {
                for (JsonNode jsonNode : jsonArray) {
                    Tarea draft = new Tarea();
                    if (jsonNode.hasNonNull("nombre"))
                        draft.setNombre(jsonNode.get("nombre").asText());
                    if (jsonNode.hasNonNull("descripcion"))
                        draft.setDescripcion(jsonNode.get("descripcion").asText());
                    if (jsonNode.hasNonNull("horasEstimadas"))
                        draft.setHorasEstimadas(jsonNode.get("horasEstimadas").asDouble());
                    if (jsonNode.hasNonNull("idPrioridad")) {
                        Prioridad prio = new Prioridad();
                        prio.setIdPrioridad(jsonNode.get("idPrioridad").asLong());
                        draft.setPrioridad(prio);
                    }
                    draftTareas.add(draft);
                }
            }
            session.setDraftTareas(draftTareas);
            evaluateDraft(chatId, session, cleanedJson);

        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId,
                    "🚨 MODO DEBUG 🚨\nEsto respondió la red al esperar arreglo JSON:\n" + llmRawResponse,
                    telegramClient, null);
        }
    }

    private void handleMissingData(Long chatId, String requestText, SessionManager.UserSession session) {
        BotHelper.sendMessageToTelegram(chatId, "🧠 Intentando complementar JSON en las subtareas...", telegramClient,
                null);

        String prompt = "Borrador previo (faltan datos): " + session.getMissingFieldsMessage() + "\nUsuario aclara: \""
                + requestText + "\". \n" +
                "Devuelve ESTRICTAMENTE como un ARREGLO JSON con nombre, descripcion, horasEstimadas (max 4h) y idPrioridad (numero 1, 2, 3) para todas las tareas: [{\"nombre\": \"...\", \"descripcion\": \"...\", \"horasEstimadas\": X, \"idPrioridad\": Y}]. No uses markdowns.";

        String llmRawResponse = "";
        try {
            llmRawResponse = deepSeekService.generateText(prompt);
            String clned = jsonHelper.extractInternalContent(llmRawResponse);
            if (clned.equals("{}") || (!clned.trim().startsWith("["))) {
                int start = llmRawResponse.indexOf('[');
                int end = llmRawResponse.lastIndexOf(']');
                if (start != -1 && end != -1 && end > start) {
                    clned = llmRawResponse.substring(start, end + 1);
                } else {
                    clned = "[" + clned + "]";
                }
            }
            JsonNode jsonArray = objectMapper.readTree(clned);
            List<Tarea> draftTareas = new ArrayList<>();
            if (jsonArray.isArray()) {
                for (JsonNode jsonNode : jsonArray) {
                    Tarea draft = new Tarea();
                    if (jsonNode.hasNonNull("nombre"))
                        draft.setNombre(jsonNode.get("nombre").asText());
                    if (jsonNode.hasNonNull("descripcion"))
                        draft.setDescripcion(jsonNode.get("descripcion").asText());
                    if (jsonNode.hasNonNull("horasEstimadas"))
                        draft.setHorasEstimadas(jsonNode.get("horasEstimadas").asDouble());
                    if (jsonNode.hasNonNull("idPrioridad")) {
                        Prioridad prio = new Prioridad();
                        prio.setIdPrioridad(jsonNode.get("idPrioridad").asLong());
                        draft.setPrioridad(prio);
                    }
                    draftTareas.add(draft);
                }
            }
            session.setDraftTareas(draftTareas);
            evaluateDraft(chatId, session, clned);

        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId,
                    "🚨 MODO DEBUG 🚨\nFallo al complementar array. Respuesta Nube:\n" + llmRawResponse, telegramClient,
                    null);
        }
    }

    private void evaluateDraft(Long chatId, SessionManager.UserSession session, String rawJsonData) {
        List<Tarea> drafts = session.getDraftTareas();
        boolean isMissing = false;

        if (drafts == null || drafts.isEmpty()) {
            isMissing = true;
        } else {
            for (Tarea d : drafts) {
                if (d.getNombre() == null || d.getNombre().isEmpty() || d.getHorasEstimadas() == null
                        || d.getPrioridad() == null) {
                    isMissing = true;
                    break;
                }
            }
        }

        if (isMissing) {
            session.setState(SessionManager.State.WAITING_FOR_MISSING_DATA);
            session.setMissingFieldsMessage(rawJsonData); // guardamos JSON como contexto para cuando el usuario envíe
                                                          // aclaración.
            BotHelper.sendMessageToTelegram(chatId,
                    "⚠️ Faltan datos constructivos.\nJSON Nube: " + rawJsonData + "\nPor favor indica lo faltante.",
                    telegramClient, null);
        } else {
            session.setState(SessionManager.State.WAITING_FOR_CONFIRMATION);
            StringBuilder summary = new StringBuilder(
                    "📝 RESUMEN DE TAREAS A REGISTRAR (" + drafts.size() + " Tareas):\n\n");

            for (int i = 0; i < drafts.size(); i++) {
                Tarea d = drafts.get(i);
                summary.append("🔹 ").append(d.getNombre()).append("\n")
                        .append(" ⏱ Est. Horas: ").append(d.getHorasEstimadas()).append("\n")
                        .append(" ⚡ Prioridad: Nivel ").append(d.getPrioridad().getIdPrioridad()).append("\n\n");
            }
            summary.append("¿Estás de acuerdo con registrar esta(s) tarea(s)? (Sí / No)");
            BotHelper.sendMessageToTelegram(chatId, summary.toString(), telegramClient, null);
        }
    }

    private void handleConfirmation(Long chatId, String requestText, SessionManager.UserSession session) {
        String rsp = requestText.trim().toLowerCase();
        if (rsp.startsWith("si") || rsp.startsWith("sí") || rsp.startsWith("yes")) {
            try {
                List<Tarea> drafts = session.getDraftTareas();
                Usuario user = getOrCreateUser(chatId);

                if (user == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ Error de auto-registro en BD. Imposible guardar las tareas.", telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                EstadoTarea estado = estadoTareaRepository.findByNombreEstado("PENDING");
                if (estado == null) {
                    estado = new EstadoTarea();
                    estado.setNombreEstado("PENDING");
                    estado = estadoTareaRepository.save(estado);
                }

                // Obtener el sprint activo (el primero disponible)
                Sprint sprintActivo = sprintRepository.findAll().stream().findFirst().orElse(null);
                if (sprintActivo == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ No hay sprints disponibles. Pide al administrador que cree uno.", telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                StringBuilder msgSuccess = new StringBuilder("✅ Hecho. Tareas registradas exitosamente:\n");

                for (Tarea d : drafts) {
                    d.setEstado(estado);
                    String pName = "Prioridad Nivel " + d.getPrioridad().getIdPrioridad();
                    Prioridad p = prioridadRepository.findByNombre(pName);
                    if (p == null) {
                        p = new Prioridad();
                        p.setNombre(pName);
                        p = prioridadRepository.save(p);
                    }
                    d.setPrioridad(p);
                    d.setFechaCreacion(OffsetDateTime.now());
                    d.setUsuarioAsignado(user);
                    d.setSprint(sprintActivo);

                    tareaRepository.save(d);
                    msgSuccess.append("- ID: ").append(d.getIdTarea()).append(" => ").append(d.getNombre())
                            .append("\n");
                }

                sessionManager.clearSession(chatId);
                BotHelper.sendMessageToTelegram(chatId, msgSuccess.toString(), telegramClient, null);
            } catch (Exception ex) {
                ex.printStackTrace();
                sessionManager.clearSession(chatId);
                BotHelper.sendMessageToTelegram(chatId, "Mmm ocurrió un error interno de BD.", telegramClient, null);
            }
        } else if (rsp.startsWith("no")) {
            sessionManager.clearSession(chatId);
            BotHelper.sendMessageToTelegram(chatId, "❌ Operación cancelada. El borrador ha sido descartado.",
                    telegramClient, null);
        } else {
            BotHelper.sendMessageToTelegram(chatId, "Por favor responde Sí o No.", telegramClient, null);
        }
    }
}
