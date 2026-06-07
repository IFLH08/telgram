package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
    private final DashboardMetricsService dashboardMetricsService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String BTN_DEVELOPER_TASKS = "Tareas Developer";
    private static final String BTN_KPI_TASKS = "KPI Tasks";
    private static final String BTN_KPI_HOURS = "KPI Hours";

    public ConversationalBotService(TelegramClient telegramClient, DeepSeekService deepSeekService,
            SessionManager sessionManager, JsonExtractionHelper jsonHelper,
            TareaRepository tareaRepository, UsuarioRepository usuarioRepository,
            EstadoTareaRepository estadoTareaRepository, PrioridadRepository prioridadRepository,
            RolRepository rolRepository, SprintRepository sprintRepository,
            DashboardMetricsService dashboardMetricsService) {
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
        this.dashboardMetricsService = dashboardMetricsService;
    }

    public void processMessage(Long chatId, String requestText) {
        SessionManager.UserSession session = sessionManager.getSession(chatId);
        String normalizedText = requestText == null ? "" : requestText.trim();
        String lowerText = normalizedText.toLowerCase(Locale.ROOT);

        if (session.getState() == SessionManager.State.WAITING_FOR_CONFIRMATION) {
            handleConfirmation(chatId, requestText, session);
            return;
        }

        if (session.getState() == SessionManager.State.WAITING_FOR_REAL_HOURS) {
            handleRealHoursInput(chatId, requestText, session);
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
                    .keyboardRow(new KeyboardRow(BTN_DEVELOPER_TASKS, BTN_KPI_TASKS))
                    .keyboardRow(new KeyboardRow(BTN_KPI_HOURS))
                    .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(),
                            BotLabels.HIDE_MAIN_SCREEN.getLabel()))
                    .resizeKeyboard(true)
                    .build();
            BotHelper.sendMessageToTelegram(chatId,
                    "Hola. Soy tu asistente de proyectos. Usa /AddTask [descripcion y horas], /tareas_desarrollador [nombre|id|username], /kpi_tasks o /kpi_hours.",
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

        if (normalizedText.equalsIgnoreCase(BTN_DEVELOPER_TASKS) || lowerText.startsWith("/tareas_desarrollador")
                || lowerText.startsWith("/developer_tasks")) {
            handleDeveloperTasksCommand(chatId, normalizedText);
            return;
        }

        if (lowerText.matches("^dev-\\d+-tareas$")) {
            handleDeveloperButton(chatId, normalizedText);
            return;
        }

        if (normalizedText.equalsIgnoreCase(BTN_KPI_TASKS) || lowerText.equals("/kpi_tasks")) {
            handleKpiTasks(chatId);
            return;
        }

        if (normalizedText.equalsIgnoreCase(BTN_KPI_HOURS) || lowerText.equals("/kpi_hours")) {
            handleKpiHours(chatId);
            return;
        }

        if (lowerText.equals("/kpis") || lowerText.equals("/kpi")) {
            handleKpiTasks(chatId);
            handleKpiHours(chatId);
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

        if (lowerText.startsWith("/addtask") || lowerText.startsWith("/additem")) {
            sessionManager.clearSession(chatId);
            session = sessionManager.getSession(chatId);
            startAddProcess(chatId, requestText, session);
            return;
        }

        BotHelper.sendMessageToTelegram(chatId,
                "🤖 Comando no reconocido. Escribe /AddTask seguido de tu instrucción o usa el menú enviando 'Show Main Screen'.",
                telegramClient, null);
    }

    private void handleDeveloperTasksCommand(Long chatId, String requestText) {
        String developerQuery = requestText
                .replaceFirst("(?i)^/tareas_desarrollador\\s*", "")
                .replaceFirst("(?i)^/developer_tasks\\s*", "")
                .trim();

        if (developerQuery.isBlank() || developerQuery.equalsIgnoreCase(BTN_DEVELOPER_TASKS)) {
            sendDeveloperDirectory(chatId);
            return;
        }

        Optional<Usuario> developer = resolveDeveloper(developerQuery);
        if (developer.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId,
                    "No encontre ese desarrollador. Usa /tareas_desarrollador sin argumentos para ver la lista.",
                    telegramClient, null);
            return;
        }

        sendDeveloperTasks(chatId, developer.get());
    }

    private void handleDeveloperButton(Long chatId, String requestText) {
        Matcher matcher = Pattern.compile("(?i)^dev-(\\d+)-tareas$").matcher(requestText.trim());
        if (!matcher.matches()) {
            sendDeveloperDirectory(chatId);
            return;
        }

        Long developerId = Long.valueOf(matcher.group(1));
        usuarioRepository.findById(developerId).ifPresentOrElse(
                developer -> sendDeveloperTasks(chatId, developer),
                () -> BotHelper.sendMessageToTelegram(chatId,
                        "No encontre el desarrollador con ID " + developerId + ".", telegramClient, null));
    }

    private void sendDeveloperDirectory(Long chatId) {
        List<Usuario> developers = usuarioRepository.findAll().stream()
                .sorted(Comparator.comparing(Usuario::getNombre, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        if (developers.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No hay desarrolladores registrados.", telegramClient, null);
            return;
        }

        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
                .resizeKeyboard(true)
                .oneTimeKeyboard(false)
                .selective(true)
                .build();
        List<KeyboardRow> keyboard = new ArrayList<>();

        StringBuilder message = new StringBuilder("Desarrolladores disponibles:\n");
        for (Usuario developer : developers) {
            message.append("- ID ").append(developer.getIdUsuario()).append(": ")
                    .append(developer.getNombre()).append(" (@").append(developer.getUsername()).append(")\n");

            KeyboardRow row = new KeyboardRow();
            row.add(developer.getNombre());
            row.add("DEV-" + developer.getIdUsuario() + "-TAREAS");
            keyboard.add(row);
        }

        KeyboardRow bottomRow = new KeyboardRow();
        bottomRow.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(bottomRow);
        keyboardMarkup.setKeyboard(keyboard);

        BotHelper.sendMessageToTelegram(chatId, message.toString(), telegramClient, keyboardMarkup);
    }

    private Optional<Usuario> resolveDeveloper(String developerQuery) {
        String cleanedQuery = developerQuery.trim().replaceFirst("^@", "");
        if (cleanedQuery.matches("\\d+")) {
            return usuarioRepository.findById(Long.valueOf(cleanedQuery));
        }

        List<Usuario> matches = usuarioRepository
                .findByNombreContainingIgnoreCaseOrUsernameContainingIgnoreCase(cleanedQuery, cleanedQuery);
        return matches.stream()
                .sorted(Comparator.comparing(Usuario::getNombre, String.CASE_INSENSITIVE_ORDER))
                .findFirst();
    }

    private void sendDeveloperTasks(Long chatId, Usuario developer) {
        List<Tarea> tasks = tareaRepository.findVisibleByUsuarioAsignado(developer.getIdUsuario());

        if (tasks.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId,
                    "No hay tareas visibles para " + developer.getNombre() + ".", telegramClient, null);
            return;
        }

        StringBuilder message = new StringBuilder();
        message.append("Tareas de ").append(developer.getNombre()).append(" (@")
                .append(developer.getUsername()).append("):\n");
        for (Tarea task : tasks) {
            message.append(formatTaskLine(task)).append("\n");
        }
        sendLongMessage(chatId, message.toString());
    }

    private String formatTaskLine(Tarea task) {
        String sprintName = task.getSprint() != null ? task.getSprint().getNombre() : "Sin sprint";
        String estado = task.getEstado() != null ? task.getEstado().getNombreEstado() : "Sin estado";
        String estimatedHours = formatNumber(task.getHorasEstimadas());
        String realHours = task.getHorasReales() != null ? formatNumber(task.getHorasReales()) : "pendiente";
        return "- #" + task.getIdTarea() + " [" + sprintName + "] " + task.getNombre()
                + " | " + estado + " | est: " + estimatedHours + "h | reales: " + realHours + "h";
    }

    private void handleKpiTasks(Long chatId) {
        List<DashboardSprintDeveloperMetricDTO> metrics = dashboardMetricsService.getSprintDeveloperMetrics();
        if (metrics.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No hay datos para KPI Tasks.", telegramClient, null);
            return;
        }

        StringBuilder message = new StringBuilder("KPI Tasks completed by user/sprint\n");
        appendGroupedKpi(message, metrics, true);
        sendLongMessage(chatId, message.toString());
    }

    private void handleKpiHours(Long chatId) {
        List<DashboardSprintDeveloperMetricDTO> metrics = dashboardMetricsService.getSprintDeveloperMetrics();
        if (metrics.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No hay datos para KPI Hours.", telegramClient, null);
            return;
        }

        StringBuilder message = new StringBuilder("KPI Total hours worked per user/sprint\n");
        appendGroupedKpi(message, metrics, false);
        sendLongMessage(chatId, message.toString());
    }

    private void appendGroupedKpi(StringBuilder message, List<DashboardSprintDeveloperMetricDTO> metrics,
            boolean completedTasks) {
        Map<String, List<DashboardSprintDeveloperMetricDTO>> bySprint = new LinkedHashMap<>();
        for (DashboardSprintDeveloperMetricDTO metric : metrics) {
            bySprint.computeIfAbsent(metric.getSprintName(), ignored -> new ArrayList<>()).add(metric);
        }

        bySprint.forEach((sprintName, sprintMetrics) -> {
            message.append("\n").append(sprintName).append("\n");
            sprintMetrics.stream()
                    .sorted(Comparator.comparing(DashboardSprintDeveloperMetricDTO::getDeveloperName,
                            String.CASE_INSENSITIVE_ORDER))
                    .forEach(metric -> {
                        message.append("- ").append(metric.getDeveloperName()).append(": ");
                        if (completedTasks) {
                            message.append(metric.getCompletedTasks()).append(" tasks");
                        } else {
                            message.append(formatNumber(metric.getRealHours())).append(" hours");
                        }
                        message.append("\n");
                    });
        });
    }

    private void handleRealHoursInput(Long chatId, String requestText, SessionManager.UserSession session) {
        if (requestText != null && requestText.trim().equalsIgnoreCase("cancelar")) {
            sessionManager.clearSession(chatId);
            BotHelper.sendMessageToTelegram(chatId, "Cierre de tarea cancelado.", telegramClient, null);
            return;
        }

        Double realHours = parseHours(requestText);
        if (realHours == null || realHours <= 0) {
            BotHelper.sendMessageToTelegram(chatId,
                    "Ingresa un numero valido de horas reales. Ejemplo: 3 o 2.5. Escribe cancelar para salir.",
                    telegramClient, null);
            return;
        }

        Long taskId = session.getPendingTaskId();
        if (taskId == null) {
            sessionManager.clearSession(chatId);
            BotHelper.sendMessageToTelegram(chatId, "No encontre una tarea pendiente de cierre.", telegramClient, null);
            return;
        }

        try {
            Tarea task = tareaRepository.findById(taskId).orElse(null);
            if (task == null) {
                sessionManager.clearSession(chatId);
                BotHelper.sendMessageToTelegram(chatId, "No se encontro la tarea con ID " + taskId + ".",
                        telegramClient, null);
                return;
            }

            EstadoTarea estado = estadoTareaRepository.findByNombreEstado("Completada");
            if (estado == null) {
                throw new IllegalStateException("No existe el estado Completada en la base de datos.");
            }

            task.setEstado(estado);
            task.setHorasReales(realHours);
            tareaRepository.save(task);
            sessionManager.clearSession(chatId);

            BotHelper.sendMessageToTelegram(chatId,
                    "Tarea " + taskId + " marcada como TERMINADA con " + formatNumber(realHours) + " horas reales.",
                    telegramClient, null);
            handleListAllTareas(chatId);
        } catch (Exception e) {
            e.printStackTrace();
            sessionManager.clearSession(chatId);
            BotHelper.sendMessageToTelegram(chatId, "Error al guardar horas reales: " + e.getMessage(), telegramClient,
                    null);
        }
    }

    private Double parseHours(String text) {
        if (text == null) {
            return null;
        }
        Matcher matcher = Pattern.compile("(\\d+(?:[\\.,]\\d+)?)").matcher(text);
        if (!matcher.find()) {
            return null;
        }
        return Double.valueOf(matcher.group(1).replace(',', '.'));
    }

    private boolean isPendingStatus(String status) {
        if (status == null) {
            return false;
        }

        String value = status.trim().toUpperCase(Locale.ROOT);
        return "PENDIENTE".equals(value) || "PENDING".equals(value);
    }

    private boolean isInProgressStatus(String status) {
        if (status == null) {
            return false;
        }

        String value = status.trim().toUpperCase(Locale.ROOT);
        return "EN PROGRESO".equals(value) || "EN_PROGRESO".equals(value) || "IN PROGRESS".equals(value);
    }

    private boolean isCompletedStatus(String status) {
        if (status == null) {
            return false;
        }

        String value = status.trim().toUpperCase(Locale.ROOT);
        return "COMPLETADA".equals(value) || "COMPLETADO".equals(value) || "COMPLETED".equals(value) || "DONE".equals(value);
    }

    private Prioridad resolvePrioridad(Prioridad draftPriority) {
        Long priorityId = draftPriority == null ? null : draftPriority.getIdPrioridad();

        if (priorityId != null) {
            Optional<Prioridad> byId = prioridadRepository.findById(priorityId);
            if (byId.isPresent()) {
                return byId.get();
            }
        }

        String priorityName;
        if (priorityId != null && priorityId == 1L) {
            priorityName = "Baja";
        } else if (priorityId != null && priorityId == 3L) {
            priorityName = "Alta";
        } else {
            priorityName = "Media";
        }

        return prioridadRepository.findByNombre(priorityName);
    }

    private String formatNumber(Double value) {
        if (value == null) {
            return "0";
        }
        if (Math.floor(value) == value) {
            return String.valueOf(value.longValue());
        }
        return String.format(Locale.US, "%.1f", value);
    }

    private void sendLongMessage(Long chatId, String text) {
        int maxLength = 3600;
        String remaining = text;
        while (remaining.length() > maxLength) {
            int splitAt = remaining.lastIndexOf('\n', maxLength);
            if (splitAt <= 0) {
                splitAt = maxLength;
            }
            BotHelper.sendMessageToTelegram(chatId, remaining.substring(0, splitAt), telegramClient, null);
            remaining = remaining.substring(splitAt).trim();
        }
        if (!remaining.isBlank()) {
            BotHelper.sendMessageToTelegram(chatId, remaining, telegramClient, null);
        }
    }

    private Usuario getOrCreateUser(Long chatId) {
        return usuarioRepository.findByTelegramId(chatId).orElseGet(() -> {
            try {
            Usuario newUser = new Usuario();
            newUser.setIdUsuario(usuarioRepository.findMaxIdUsuario() + 1);
            newUser.setTelegramId(chatId);
            newUser.setNombre("Telegram User " + chatId);
            newUser.setUsername("tg_" + chatId);
            newUser.setFechaRegistro(OffsetDateTime.now());
                Rol rol = rolRepository.findByNombreRol("DESARROLLADOR");
                if (rol == null) {
                    rol = rolRepository.findByNombreRol("developer");
                }
                if (rol == null) {
                    rol = rolRepository.findByNombreRol("Desarrollador");
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
                    t -> t.getEstado() != null && !isCompletedStatus(t.getEstado().getNombreEstado()))
                    .collect(Collectors.toList());
            List<Tarea> terminadas = allItems.stream()
                    .filter(t -> t.getEstado() != null && isCompletedStatus(t.getEstado().getNombreEstado()))
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
                if (isPendingStatus(item.getEstado().getNombreEstado())) {
                    currentRow.add(item.getIdTarea() + "-INICIAR");
                } else if (isInProgressStatus(item.getEstado().getNombreEstado())) {
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
            EstadoTarea estado = estadoTareaRepository.findByNombreEstado("En progreso");
            if (estado == null) {
                throw new IllegalStateException("No existe el estado En progreso en la base de datos.");
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
            SessionManager.UserSession session = sessionManager.getSession(chatId);
            session.setState(SessionManager.State.WAITING_FOR_REAL_HOURS);
            session.setPendingTaskId(id);
            BotHelper.sendMessageToTelegram(chatId,
                    "Ingresa las horas reales trabajadas para cerrar la tarea " + id + ". Ejemplo: 2.5",
                    telegramClient, null);
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

        String retrievedContext = "";
        try {
            var similarDocs = deepSeekService.findRelevantToDoDescriptions(requestText, 3);
            if (!similarDocs.isEmpty()) {
                StringBuilder contextBuilder = new StringBuilder();
                contextBuilder.append("Contexto relevante recuperado de tareas existentes en Oracle:\n");
                for (int i = 0; i < similarDocs.size(); i++) {
                    contextBuilder.append("- ").append(similarDocs.get(i)).append("\n");
                }
                retrievedContext = contextBuilder.toString() + "\n";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        String prompt = retrievedContext +
                "Resume esta tarea en formato JSON. Genera nombre, descripcion, horasEstimadas y idPrioridad (1 baja, 2 media, 3 alta). IMPORTANTE: La regla de Oracle indica que ninguna tarea debe tener un estimado mayor a 4 horas. Si el requerimiento excede las 4 horas, debes subdividir lógicamente la tarea en múltiples subtareas (cada una de máximo 4 horas). Debes devolver el resultado ESTRICTAMENTE como un ARREGLO JSON (incluso si es una sola tarea): [{\"nombre\": \"...\", \"descripcion\": \"...\", \"horasEstimadas\": X, \"idPrioridad\": Y}]. Responde puro JSON:\n"
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

                EstadoTarea estado = estadoTareaRepository.findByNombreEstado("Pendiente");
                if (estado == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "No existe el estado Pendiente en la base de datos.", telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
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

                Long nextTaskId = tareaRepository.findMaxIdTarea() + 1;
                for (Tarea d : drafts) {
                    d.setIdTarea(nextTaskId++);
                    d.setEstado(estado);
                    Prioridad p = resolvePrioridad(d.getPrioridad());
                    if (p == null) {
                        BotHelper.sendMessageToTelegram(chatId,
                                "No pude resolver la prioridad de una tarea. Usa prioridad baja, media o alta.",
                                telegramClient, null);
                        sessionManager.clearSession(chatId);
                        return;
                    }
                    d.setPrioridad(p);
                    d.setFechaCreacion(LocalDateTime.now());
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
