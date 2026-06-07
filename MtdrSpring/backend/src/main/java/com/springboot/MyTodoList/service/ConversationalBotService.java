package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO;
import com.springboot.MyTodoList.model.EstadoTarea;
import com.springboot.MyTodoList.model.Prioridad;
import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Rol;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.EstadoTareaRepository;
import com.springboot.MyTodoList.repository.PrioridadRepository;
import com.springboot.MyTodoList.repository.ProyectoRepository;
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

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Duration;
import java.time.format.DateTimeParseException;
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
    private final ProyectoRepository proyectoRepository;
    private final RolRepository rolRepository;
    private final SprintRepository sprintRepository;
    private final DashboardMetricsService dashboardMetricsService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String BTN_DEVELOPER_TASKS = "Tareas Developer";
    private static final String BTN_LIST_ALL_PROJECTS = BotLabels.LIST_ALL_PROJECTS.getLabel();
    private static final String BTN_LIST_ALL_SPRINTS = BotLabels.LIST_ALL_SPRINTS.getLabel();
    private static final String BTN_KPI_TASKS = "KPI Tasks";
    private static final String BTN_KPI_HOURS = "KPI Hours";
    private static final String ROLE_ADMIN = "ADMINISTRADOR";
    private static final String ROLE_MANAGER = "MANAGER";
    private static final String ROLE_DEVELOPER = "DEVELOPER";
    private static final String ADD_TASK_FORMAT = "/AddTask <developer|id|@username> | <descripcion de la tarea>";
    private static final String ADD_SPRINT_FORMAT = "/AddSprint <codigoProyecto> | <nombreSprint> | <fechaInicio YYYY-MM-DD> | <fechaFin YYYY-MM-DD>";

    public ConversationalBotService(TelegramClient telegramClient, DeepSeekService deepSeekService,
            SessionManager sessionManager, JsonExtractionHelper jsonHelper,
            TareaRepository tareaRepository, UsuarioRepository usuarioRepository,
            EstadoTareaRepository estadoTareaRepository, PrioridadRepository prioridadRepository,
            ProyectoRepository proyectoRepository,
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
        this.proyectoRepository = proyectoRepository;
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

        if (session.getState() == SessionManager.State.WAITING_FOR_PROJECT_CODE) {
            handleProjectCodeSelection(chatId, requestText, session);
            return;
        }

        if (session.getState() == SessionManager.State.WAITING_FOR_SPRINT_SELECTION) {
            handleSprintSelection(chatId, requestText, session);
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
                    .keyboardRow(new KeyboardRow(BTN_LIST_ALL_PROJECTS, BTN_LIST_ALL_SPRINTS))
                    .keyboardRow(new KeyboardRow(BTN_DEVELOPER_TASKS, BTN_KPI_TASKS))
                    .keyboardRow(new KeyboardRow(BTN_KPI_HOURS))
                    .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(),
                            BotLabels.HIDE_MAIN_SCREEN.getLabel()))
                    .resizeKeyboard(true)
                    .build();
            BotHelper.sendMessageToTelegram(chatId,
                    "Hola. Soy tu asistente de proyectos. Usa " + ADD_TASK_FORMAT
                            + ", " + ADD_SPRINT_FORMAT
                            + ", /projects, /sprints, /tareas_desarrollador [nombre|id|username], /kpi_tasks o /kpi_hours.",
                    telegramClient, keyboardMarkup);
            return;
        }

        if (requestText.equalsIgnoreCase(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {
            BotHelper.sendMessageToTelegram(chatId, "Menú oculto. Escribe /start para volver a verlo.", telegramClient,
                    null);
            return;
        }

        if (requestText.equalsIgnoreCase(BotLabels.ADD_NEW_ITEM.getLabel())) {
            BotHelper.sendMessageToTelegram(chatId,
                    "🤖 Para crear una tarea usa este formato:\n" + ADD_TASK_FORMAT
                            + "\nEjemplo: /AddTask 4 | Implementar endpoint para cerrar sprint en 3 horas.",
                    telegramClient, null);
            return;
        }

        if (requestText.equalsIgnoreCase(BTN_LIST_ALL_PROJECTS) || lowerText.equals("/projects")
                || lowerText.equals("/proyectos")) {
            handleListAllProjects(chatId);
            return;
        }

        if (requestText.equalsIgnoreCase(BTN_LIST_ALL_SPRINTS) || lowerText.equals("/sprints")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            handleListAllSprints(chatId);
            return;
        }

        if (requestText.equalsIgnoreCase(BotLabels.MY_TODO_LIST.getLabel())
                || requestText.equalsIgnoreCase(BotLabels.LIST_ALL_ITEMS.getLabel())) {
            handleListAllTareas(chatId);
            return;
        }

        if (normalizedText.equalsIgnoreCase(BTN_DEVELOPER_TASKS) || lowerText.startsWith("/tareas_desarrollador")
                || lowerText.startsWith("/developer_tasks")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            handleDeveloperTasksCommand(chatId, normalizedText);
            return;
        }

        if (lowerText.matches("^dev-\\d+-tareas$")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            handleDeveloperButton(chatId, normalizedText);
            return;
        }

        if (normalizedText.equalsIgnoreCase(BTN_KPI_TASKS) || lowerText.equals("/kpi_tasks")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            handleKpiTasks(chatId);
            return;
        }

        if (normalizedText.equalsIgnoreCase(BTN_KPI_HOURS) || lowerText.equals("/kpi_hours")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            handleKpiHours(chatId);
            return;
        }

        if (lowerText.equals("/kpis") || lowerText.equals("/kpi")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            handleKpiTasks(chatId);
            handleKpiHours(chatId);
            return;
        }

        if (requestText.contains("-INICIAR")) {
            handleMarcarIniciada(chatId, requestText);
            return;
        }

        if (requestText.contains("-PAUSAR")) {
            handlePausarTarea(chatId, requestText);
            return;
        }

        if (requestText.contains("-REANUDAR")) {
            handleReanudarTarea(chatId, requestText);
            return;
        }

        if (requestText.contains("-TERMINAR")) {
            handleMarcarTerminada(chatId, requestText);
            return;
        }

        if (lowerText.startsWith("/addtask") || lowerText.startsWith("/additem")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            sessionManager.clearSession(chatId);
            session = sessionManager.getSession(chatId);
            startAddProcess(chatId, requestText, session);
            return;
        }

        if (lowerText.startsWith("/addsprint")) {
            Usuario actor = getOrCreateUser(chatId);
            if (!isAdminOrManager(actor)) {
                sendAdminOnlyMessage(chatId);
                return;
            }
            handleAddSprint(chatId, requestText);
            return;
        }

        BotHelper.sendMessageToTelegram(chatId,
                "🤖 Comando no reconocido. Usa " + ADD_TASK_FORMAT
                        + " o abre el menú enviando 'Show Main Screen'.",
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
                .filter(this::isDeveloper)
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
                .filter(this::isDeveloper)
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

    private void handleListAllProjects(Long chatId) {
        try {
            List<Proyecto> projects = proyectoRepository.findAll().stream()
                    .sorted(Comparator.comparing(Proyecto::getFechaInicio,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());

            if (projects.isEmpty()) {
                BotHelper.sendMessageToTelegram(chatId, "No hay proyectos registrados.", telegramClient, null);
                return;
            }

            StringBuilder message = new StringBuilder("Proyectos registrados:\n");
            for (Proyecto project : projects) {
                message.append("- #").append(project.getIdProyecto()).append(" ").append(project.getNombre());
                if (project.getCodigoAcceso() != null && !project.getCodigoAcceso().isBlank()) {
                    message.append(" | codigo: ").append(project.getCodigoAcceso());
                }
                if (project.getFechaInicio() != null || project.getFechaFin() != null) {
                    message.append(" | ");
                    message.append(project.getFechaInicio() != null ? project.getFechaInicio().toLocalDate() : "?");
                    message.append(" -> ");
                    message.append(project.getFechaFin() != null ? project.getFechaFin().toLocalDate() : "?");
                }
                if (project.getDescripcion() != null && !project.getDescripcion().isBlank()) {
                    message.append("\n  ").append(project.getDescripcion());
                }
                message.append("\n");
            }

            sendLongMessage(chatId, message.toString());
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "❌ Error al listar proyectos: " + e.getMessage(),
                    telegramClient, null);
        }
    }

    private void handleListAllSprints(Long chatId) {
        try {
            List<Sprint> sprints = sprintRepository.findAll().stream()
                    .sorted(Comparator.comparing(Sprint::getFechaInicio,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());

            if (sprints.isEmpty()) {
                BotHelper.sendMessageToTelegram(chatId, "No hay sprints registrados.", telegramClient, null);
                return;
            }

            StringBuilder message = new StringBuilder("Sprints registrados:\n");
            for (Sprint sprint : sprints) {
                message.append("- #").append(sprint.getIdSprint()).append(" ").append(sprint.getNombre());
                if (sprint.getProyecto() != null) {
                    message.append(" | proyecto: ").append(sprint.getProyecto().getNombre());
                    if (sprint.getProyecto().getCodigoAcceso() != null
                            && !sprint.getProyecto().getCodigoAcceso().isBlank()) {
                        message.append(" (").append(sprint.getProyecto().getCodigoAcceso()).append(")");
                    }
                }
                if (sprint.getFechaInicio() != null || sprint.getFechaFin() != null) {
                    message.append(" | ");
                    message.append(sprint.getFechaInicio() != null ? sprint.getFechaInicio().toLocalDate() : "?");
                    message.append(" -> ");
                    message.append(sprint.getFechaFin() != null ? sprint.getFechaFin().toLocalDate() : "?");
                }
                message.append("\n");
            }

            sendLongMessage(chatId, message.toString());
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "âŒ Error al listar sprints: " + e.getMessage(),
                    telegramClient, null);
        }
    }

    private void handleAddSprint(Long chatId, String requestText) {
        Optional<AddSprintRequest> addSprintRequest = parseAddSprintRequest(requestText);
        if (addSprintRequest.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId,
                    "Para crear un sprint necesito este formato:\n" + ADD_SPRINT_FORMAT
                            + "\nEjemplo: /AddSprint QJVSLH71 | Sprint 1 | 2026-06-03 | 2026-06-17",
                    telegramClient, null);
            sendProjectDirectory(chatId);
            return;
        }

        Proyecto project = proyectoRepository.findByCodigoAcceso(
                addSprintRequest.get().projectCode().toUpperCase(Locale.ROOT));
        if (project == null) {
            BotHelper.sendMessageToTelegram(chatId,
                    "No encontrÃ© un proyecto con ese cÃ³digo. Usa /projects para ver los disponibles.",
                    telegramClient, null);
            return;
        }

        try {
            LocalDateTime start = LocalDate.parse(addSprintRequest.get().startDate()).atStartOfDay();
            LocalDateTime end = LocalDate.parse(addSprintRequest.get().endDate()).atTime(23, 59, 59);

            if (end.isBefore(start)) {
                BotHelper.sendMessageToTelegram(chatId,
                        "La fecha fin no puede ser anterior a la fecha inicio.", telegramClient, null);
                return;
            }

            Sprint sprint = new Sprint();
            sprint.setIdSprint(sprintRepository.findMaxIdSprint() + 1);
            sprint.setNombre(addSprintRequest.get().sprintName());
            sprint.setFechaInicio(start);
            sprint.setFechaFin(end);
            sprint.setProyecto(project);

            sprintRepository.save(sprint);

            BotHelper.sendMessageToTelegram(chatId,
                    "âœ… Sprint creado: #" + sprint.getIdSprint() + " " + sprint.getNombre()
                            + " para " + project.getNombre() + " (" + project.getCodigoAcceso() + ")"
                            + "\n" + start.toLocalDate() + " -> " + end.toLocalDate(),
                    telegramClient, null);
        } catch (DateTimeParseException e) {
            BotHelper.sendMessageToTelegram(chatId,
                    "Formato de fecha invÃ¡lido. Usa YYYY-MM-DD. Ejemplo: 2026-06-17", telegramClient, null);
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "âŒ Error al crear sprint: " + e.getMessage(), telegramClient,
                    null);
        }
    }

    private void sendProjectDirectory(Long chatId) {
        List<Proyecto> projects = proyectoRepository.findAll().stream()
                .sorted(Comparator.comparing(Proyecto::getNombre, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        if (projects.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No hay proyectos registrados.", telegramClient, null);
            return;
        }

        StringBuilder message = new StringBuilder("Codigos de proyecto disponibles:\n");
        for (Proyecto project : projects) {
            message.append("- ").append(project.getCodigoAcceso()).append(": ").append(project.getNombre()).append("\n");
        }
        BotHelper.sendMessageToTelegram(chatId, message.toString(), telegramClient, null);
    }

    private void sendProjectSprintDirectory(Long chatId, Proyecto project, List<Sprint> sprints) {
        StringBuilder message = new StringBuilder("Sprints disponibles para ")
                .append(project.getNombre());
        if (project.getCodigoAcceso() != null && !project.getCodigoAcceso().isBlank()) {
            message.append(" (").append(project.getCodigoAcceso()).append(")");
        }
        message.append(":\n");

        for (Sprint sprint : sprints) {
            message.append("- ID ").append(sprint.getIdSprint()).append(": ").append(sprint.getNombre());
            if (sprint.getFechaInicio() != null || sprint.getFechaFin() != null) {
                message.append(" | ");
                message.append(sprint.getFechaInicio() != null ? sprint.getFechaInicio().toLocalDate() : "?");
                message.append(" -> ");
                message.append(sprint.getFechaFin() != null ? sprint.getFechaFin().toLocalDate() : "?");
            }
            message.append("\n");
        }

        message.append("\nResponde con el ID del sprint donde quieres registrar la tarea. Escribe cancelar para salir.");
        BotHelper.sendMessageToTelegram(chatId, message.toString(), telegramClient, null);
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
            Usuario actor = getOrCreateUser(chatId);
            Tarea task = tareaRepository.findById(taskId).orElse(null);
            if (task == null) {
                sessionManager.clearSession(chatId);
                BotHelper.sendMessageToTelegram(chatId, "No se encontro la tarea con ID " + taskId + ".",
                        telegramClient, null);
                return;
            }

            if (!canManageOwnTask(actor, task)) {
                sessionManager.clearSession(chatId);
                sendTaskOwnershipDeniedMessage(chatId);
                return;
            }

            EstadoTarea estado = estadoTareaRepository.findByNombreEstado("Completada");
            if (estado == null) {
                throw new IllegalStateException("No existe el estado Completada en la base de datos.");
            }

            task.setEstado(estado);
            if (task.getFechaInicioReal() == null) {
                task.setFechaInicioReal(LocalDateTime.now());
            }
            task.setFechaFinReal(LocalDateTime.now());
            tareaRepository.save(task);

            // Some database environments recalculate HORAS_REALES when the real start/end
            // timestamps change. Persist the developer-provided value in a second update so
            // the manual number wins.
            Tarea closedTask = tareaRepository.findById(taskId)
                    .orElseThrow(() -> new IllegalStateException("No se pudo recargar la tarea tras cerrarla."));
            closedTask.setHorasReales(realHours);
            tareaRepository.save(closedTask);
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

    private double roundHours(double value) {
        return Math.round(value * 100.0d) / 100.0d;
    }

    private double getAccumulatedHours(Tarea task) {
        return task != null && task.getHorasReales() != null ? task.getHorasReales() : 0.0d;
    }

    private boolean hasActiveTimer(Tarea task) {
        return task != null && task.getFechaInicioReal() != null;
    }

    private double calculateElapsedHours(LocalDateTime startedAt, LocalDateTime endedAt) {
        if (startedAt == null || endedAt == null || endedAt.isBefore(startedAt)) {
            return 0.0d;
        }

        return roundHours(Duration.between(startedAt, endedAt).getSeconds() / 3600.0d);
    }

    private double accumulateTrackedHours(Tarea task, LocalDateTime endedAt) {
        double totalHours = getAccumulatedHours(task);
        if (task == null || task.getFechaInicioReal() == null) {
            return roundHours(totalHours);
        }

        totalHours += calculateElapsedHours(task.getFechaInicioReal(), endedAt);
        task.setHorasReales(roundHours(totalHours));
        task.setFechaInicioReal(null);
        return task.getHorasReales();
    }

    private EstadoTarea resolveOrCreateEstado(String nombreEstado) {
        EstadoTarea estado = estadoTareaRepository.findByNombreEstado(nombreEstado);
        if (estado != null) {
            return estado;
        }

        EstadoTarea nuevoEstado = new EstadoTarea();
        nuevoEstado.setNombreEstado(nombreEstado);
        return estadoTareaRepository.save(nuevoEstado);
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

    private boolean isPausedStatus(String status) {
        if (status == null) {
            return false;
        }

        String value = status.trim().toUpperCase(Locale.ROOT);
        return "PAUSADA".equals(value) || "PAUSADO".equals(value) || "PAUSED".equals(value);
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

    private String normalizeRoleName(String roleName) {
        if (roleName == null) {
            return "";
        }

        String value = roleName.trim().toUpperCase(Locale.ROOT);
        if ("ADMIN".equals(value) || "ADMINISTRADOR".equals(value)) {
            return ROLE_ADMIN;
        }
        if ("MANAGER".equals(value)) {
            return ROLE_MANAGER;
        }
        if ("DESARROLLADOR".equals(value) || "DEVELOPER".equals(value)) {
            return ROLE_DEVELOPER;
        }
        return value;
    }

    private boolean isAdminOrManager(Usuario user) {
        if (user == null || user.getRol() == null) {
            return false;
        }

        String roleName = normalizeRoleName(user.getRol().getNombreRol());
        return ROLE_ADMIN.equals(roleName) || ROLE_MANAGER.equals(roleName);
    }

    private boolean isDeveloper(Usuario user) {
        if (user == null || user.getRol() == null) {
            return false;
        }

        return ROLE_DEVELOPER.equals(normalizeRoleName(user.getRol().getNombreRol()));
    }

    private boolean canManageOwnTask(Usuario user, Tarea task) {
        if (user == null || task == null || task.getUsuarioAsignado() == null
                || task.getUsuarioAsignado().getIdUsuario() == null) {
            return false;
        }

        return task.getUsuarioAsignado().getIdUsuario().equals(user.getIdUsuario());
    }

    private void sendAdminOnlyMessage(Long chatId) {
        BotHelper.sendMessageToTelegram(chatId,
                "Solo administradores o managers pueden usar ese comando en el bot.",
                telegramClient, null);
    }

    private void sendTaskOwnershipDeniedMessage(Long chatId) {
        BotHelper.sendMessageToTelegram(chatId,
                "Solo puedes iniciar, terminar o cerrar horas en tus propias tareas asignadas.",
                telegramClient, null);
    }

    private Rol findRoleByNames(String... roleNames) {
        for (String roleName : roleNames) {
            Rol role = rolRepository.findByNombreRol(roleName);
            if (role != null) {
                return role;
            }
        }
        return null;
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
                Rol rol = findRoleByNames("Developer", "DESARROLLADOR", "developer", "Desarrollador");
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
                String estadoNombre = item.getEstado().getNombreEstado();
                if (hasActiveTimer(item) && isInProgressStatus(estadoNombre)) {
                    currentRow.add(item.getIdTarea() + "-PAUSAR");
                    currentRow.add(item.getIdTarea() + "-TERMINAR");
                } else if (isPausedStatus(estadoNombre)
                        || (isInProgressStatus(estadoNombre) && !hasActiveTimer(item))) {
                    currentRow.add(item.getIdTarea() + "-REANUDAR");
                    currentRow.add(item.getIdTarea() + "-TERMINAR");
                } else if (isPendingStatus(estadoNombre)) {
                    currentRow.add(item.getIdTarea() + "-INICIAR");
                } else if (isInProgressStatus(estadoNombre)) {
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
            Usuario actor = getOrCreateUser(chatId);
            Long id = Long.parseLong(requestText.split("-")[0]);
            Tarea t = tareaRepository.findById(id).orElse(null);
            if (t == null) {
                BotHelper.sendMessageToTelegram(chatId, "⚠️ No se encontró la tarea con ID " + id + ".", telegramClient,
                        null);
                return;
            }
            if (!canManageOwnTask(actor, t)) {
                sendTaskOwnershipDeniedMessage(chatId);
                return;
            }
            if (hasActiveTimer(t)) {
                BotHelper.sendMessageToTelegram(chatId, "La tarea " + id + " ya tiene un timer en curso.",
                        telegramClient, null);
                return;
            }
            EstadoTarea estado = resolveOrCreateEstado("En progreso");
            boolean reanudada = isPausedStatus(t.getEstado() != null ? t.getEstado().getNombreEstado() : null)
                    || getAccumulatedHours(t) > 0;
            t.setEstado(estado);
            t.setFechaInicioReal(LocalDateTime.now());
            t.setFechaFinReal(null);
            tareaRepository.save(t);
            BotHelper.sendMessageToTelegram(chatId,
                    (reanudada ? "Tarea " + id + " reanudada." : "Tarea " + id + " marcada como iniciada."),
                    telegramClient, null);
            handleListAllTareas(chatId);
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "❌ Error al iniciar tarea: " + e.getMessage(), telegramClient,
                    null);
        }
    }

    private void handleReanudarTarea(Long chatId, String requestText) {
        handleMarcarIniciada(chatId, requestText);
    }

    private void handlePausarTarea(Long chatId, String requestText) {
        try {
            Usuario actor = getOrCreateUser(chatId);
            Long id = Long.parseLong(requestText.split("-")[0]);
            Tarea task = tareaRepository.findById(id).orElse(null);
            if (task == null) {
                BotHelper.sendMessageToTelegram(chatId, "⚠️ No se encontró la tarea con ID " + id + ".", telegramClient,
                        null);
                return;
            }
            if (!canManageOwnTask(actor, task)) {
                sendTaskOwnershipDeniedMessage(chatId);
                return;
            }
            if (!hasActiveTimer(task)) {
                BotHelper.sendMessageToTelegram(chatId,
                        "La tarea " + id + " no tiene un timer activo para pausar.", telegramClient, null);
                return;
            }

            double totalHours = accumulateTrackedHours(task, LocalDateTime.now());
            task.setEstado(resolveOrCreateEstado("Pausada"));
            task.setFechaFinReal(null);
            tareaRepository.save(task);

            BotHelper.sendMessageToTelegram(chatId,
                    "⏸️ Tarea " + id + " pausada. Tiempo acumulado: " + formatNumber(totalHours) + " horas.",
                    telegramClient, null);
            handleListAllTareas(chatId);
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "❌ Error al pausar tarea: " + e.getMessage(), telegramClient,
                    null);
        }
    }

    private void handleMarcarTerminada(Long chatId, String requestText) {
        try {
            Usuario actor = getOrCreateUser(chatId);
            Long id = Long.parseLong(requestText.split("-")[0]);
            Tarea t = tareaRepository.findById(id).orElse(null);
            if (t == null) {
                BotHelper.sendMessageToTelegram(chatId, "⚠️ No se encontró la tarea con ID " + id + ".", telegramClient,
                        null);
                return;
            }
            if (!canManageOwnTask(actor, t)) {
                sendTaskOwnershipDeniedMessage(chatId);
                return;
            }
            LocalDateTime now = LocalDateTime.now();
            double totalHours = getAccumulatedHours(t);
            if (hasActiveTimer(t)) {
                totalHours = accumulateTrackedHours(t, now);
            }

            if (totalHours <= 0) {
                SessionManager.UserSession session = sessionManager.getSession(chatId);
                session.setState(SessionManager.State.WAITING_FOR_REAL_HOURS);
                session.setPendingTaskId(id);
                BotHelper.sendMessageToTelegram(chatId,
                        "Ingresa las horas reales trabajadas para cerrar la tarea " + id + ". Ejemplo: 2.5",
                        telegramClient, null);
                return;
            }

            t.setEstado(resolveOrCreateEstado("Completada"));
            t.setHorasReales(roundHours(totalHours));
            t.setFechaFinReal(now);
            tareaRepository.save(t);

            BotHelper.sendMessageToTelegram(chatId,
                    "✅ Tarea " + id + " marcada como TERMINADA con " + formatNumber(t.getHorasReales())
                            + " horas acumuladas.",
                    telegramClient, null);
            handleListAllTareas(chatId);
        } catch (Exception e) {
            e.printStackTrace();
            BotHelper.sendMessageToTelegram(chatId, "❌ Error al terminar tarea: " + e.getMessage(), telegramClient,
                    null);
        }
    }

    private void startAddProcess(Long chatId, String requestText, SessionManager.UserSession session) {
        Optional<AddTaskRequest> addTaskRequest = parseAddTaskRequest(requestText);
        if (addTaskRequest.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId,
                    "Para crear tareas necesito este formato:\n" + ADD_TASK_FORMAT
                            + "\nEjemplo: /AddTask @ian | Preparar pruebas del bot en 2 horas.",
                    telegramClient, null);
            sendDeveloperDirectory(chatId);
            return;
        }

        Optional<Usuario> assignee = resolveDeveloper(addTaskRequest.get().developerQuery());
        if (assignee.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId,
                    "No encontre al developer '" + addTaskRequest.get().developerQuery()
                            + "'. Elige uno de esta lista e intenta de nuevo.",
                    telegramClient, null);
            sendDeveloperDirectory(chatId);
            return;
        }

        session.setPendingAssigneeId(assignee.get().getIdUsuario());
        session.setPendingAssigneeName(formatDeveloperLabel(assignee.get()));
        session.setPendingTaskDescription(addTaskRequest.get().taskDescription());
        session.setState(SessionManager.State.WAITING_FOR_PROJECT_CODE);
        BotHelper.sendMessageToTelegram(chatId,
                "📁 Ahora responde con el codigo del proyecto donde quieres registrar la tarea para "
                        + formatDeveloperLabel(assignee.get()) + ".\nEjemplo: DEV999AA\nEscribe cancelar para salir.",
                telegramClient, null);
        sendProjectDirectory(chatId);
    }

    private void handleMissingData(Long chatId, String requestText, SessionManager.UserSession session) {
        Optional<List<Tarea>> manualDrafts = tryBuildDraftsFromStructuredInput(requestText);
        if (manualDrafts.isPresent()) {
            session.setDraftTareas(manualDrafts.get());
            evaluateDraft(chatId, session, requestText);
            return;
        }

        BotHelper.sendMessageToTelegram(chatId, "🧠 Intentando complementar JSON en las subtareas...", telegramClient,
                null);

        Optional<List<Tarea>> clarifiedDrafts = tryBuildDraftsFromClarification(session.getPendingTaskDescription(),
                requestText);
        if (clarifiedDrafts.isPresent()) {
            session.setDraftTareas(clarifiedDrafts.get());
            evaluateDraft(chatId, session, requestText);
            return;
        }

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

    private void handleProjectCodeSelection(Long chatId, String requestText, SessionManager.UserSession session) {
        String trimmed = requestText == null ? "" : requestText.trim();
        if (trimmed.equalsIgnoreCase("cancelar")) {
            sessionManager.clearSession(chatId);
            BotHelper.sendMessageToTelegram(chatId, "❌ Operación cancelada. El borrador ha sido descartado.",
                    telegramClient, null);
            return;
        }

        Proyecto project = proyectoRepository.findByCodigoAcceso(trimmed.toUpperCase(Locale.ROOT));
        if (project == null) {
            BotHelper.sendMessageToTelegram(chatId,
                    "No encontré un proyecto con ese código. Responde solo con el código de acceso o escribe cancelar.",
                    telegramClient, null);
            sendProjectDirectory(chatId);
            return;
        }

        session.setPendingProjectId(project.getIdProyecto());
        session.setPendingProjectCode(project.getCodigoAcceso());
        session.setPendingProjectName(project.getNombre());
        session.setPendingSprintId(null);
        session.setPendingSprintName("");

        List<Sprint> projectSprints = sprintRepository.findByProyectoIdProyectoOrderByFechaInicioAsc(project.getIdProyecto());
        if (projectSprints.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId,
                    "âŒ El proyecto " + project.getNombre() + " no tiene sprints registrados.\nCrea uno con:\n"
                            + ADD_SPRINT_FORMAT,
                    telegramClient, null);
            sessionManager.clearSession(chatId);
            return;
        }

        session.setState(SessionManager.State.WAITING_FOR_SPRINT_SELECTION);
        sendProjectSprintDirectory(chatId, project, projectSprints);
    }

    private void handleSprintSelection(Long chatId, String requestText, SessionManager.UserSession session) {
        String trimmed = requestText == null ? "" : requestText.trim();
        if (trimmed.equalsIgnoreCase("cancelar")) {
            sessionManager.clearSession(chatId);
            BotHelper.sendMessageToTelegram(chatId, "âŒ OperaciÃ³n cancelada. El borrador ha sido descartado.",
                    telegramClient, null);
            return;
        }

        Long projectId = session.getPendingProjectId();
        if (projectId == null) {
            sessionManager.clearSession(chatId);
            BotHelper.sendMessageToTelegram(chatId,
                    "âŒ La sesiÃ³n perdiÃ³ el proyecto seleccionado. Vuelve a ejecutar " + ADD_TASK_FORMAT + ".",
                    telegramClient, null);
            return;
        }

        if (!trimmed.matches("\\d+")) {
            BotHelper.sendMessageToTelegram(chatId,
                    "Responde solo con el ID del sprint. Ejemplo: 12. Escribe cancelar para salir.",
                    telegramClient, null);
            return;
        }

        Long sprintId = Long.valueOf(trimmed);
        Sprint sprint = sprintRepository.findById(sprintId).orElse(null);
        if (sprint == null || sprint.getProyecto() == null || sprint.getProyecto().getIdProyecto() == null
                || !sprint.getProyecto().getIdProyecto().equals(projectId)) {
            Proyecto project = proyectoRepository.findById(projectId).orElse(null);
            BotHelper.sendMessageToTelegram(chatId,
                    "No encontrÃ© ese sprint dentro del proyecto seleccionado. Responde con un ID vÃ¡lido.",
                    telegramClient, null);
            if (project != null) {
                sendProjectSprintDirectory(chatId, project,
                        sprintRepository.findByProyectoIdProyectoOrderByFechaInicioAsc(projectId));
            }
            return;
        }

        session.setPendingSprintId(sprint.getIdSprint());
        session.setPendingSprintName(sprint.getNombre());
        processTaskDescription(chatId, session.getPendingTaskDescription(), session);
    }

    private void processTaskDescription(Long chatId, String taskDescription, SessionManager.UserSession session) {
        Optional<List<Tarea>> inferredDrafts = tryBuildDraftsFromNaturalLanguage(taskDescription);
        if (inferredDrafts.isPresent()) {
            session.setDraftTareas(inferredDrafts.get());
            evaluateDraft(chatId, session, taskDescription);
            return;
        }

        BotHelper.sendMessageToTelegram(chatId,
                "🧠 Procesando petición resumida y evaluando límites de tiempo (máx 4h según buenas prácticas)...",
                telegramClient, null);

        String prompt = "Resume esta tarea en formato JSON. Genera nombre, descripcion, horasEstimadas y idPrioridad (1 baja, 2 media, 3 alta). IMPORTANTE: La regla de Oracle indica que ninguna tarea debe tener un estimado mayor a 4 horas. Si el requerimiento excede las 4 horas, debes subdividir lógicamente la tarea en múltiples subtareas (cada una de máximo 4 horas). Debes devolver el resultado ESTRICTAMENTE como un ARREGLO JSON (incluso si es una sola tarea): [{\"nombre\": \"...\", \"descripcion\": \"...\", \"horasEstimadas\": X, \"idPrioridad\": Y}]. Responde puro JSON:\n"
                + taskDescription;
        if (extractEstimatedHours(taskDescription) == null) {
            session.setState(SessionManager.State.WAITING_FOR_MISSING_DATA);
            session.setMissingFieldsMessage(taskDescription);
            BotHelper.sendMessageToTelegram(chatId,
                    "Necesito al menos las horas estimadas para construir la tarea.\n"
                            + "Responde, por ejemplo:\nHoras estimadas: 4\nPrioridad: alta\n"
                            + "o envia JSON como [{\"nombre\":\"...\",\"descripcion\":\"...\",\"horasEstimadas\":4,\"idPrioridad\":3}]",
                    telegramClient, null);
            return;
        }

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
            if (session.getPendingAssigneeName() != null && !session.getPendingAssigneeName().isBlank()) {
                summary.append("👤 Developer asignado: ").append(session.getPendingAssigneeName()).append("\n\n");
            }
            if (session.getPendingProjectName() != null && !session.getPendingProjectName().isBlank()) {
                summary.append("📁 Proyecto: ").append(session.getPendingProjectName());
                if (session.getPendingProjectCode() != null && !session.getPendingProjectCode().isBlank()) {
                    summary.append(" (").append(session.getPendingProjectCode()).append(")");
                }
                summary.append("\n\n");
            }

            if (session.getPendingSprintName() != null && !session.getPendingSprintName().isBlank()) {
                summary.append("ðŸ—‚ Sprint: ").append(session.getPendingSprintName());
                if (session.getPendingSprintId() != null) {
                    summary.append(" (#").append(session.getPendingSprintId()).append(")");
                }
                summary.append("\n\n");
            }

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
                Usuario actor = getOrCreateUser(chatId);

                if (actor == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ Error de auto-registro en BD. Imposible guardar las tareas.", telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                Long pendingAssigneeId = session.getPendingAssigneeId();
                if (pendingAssigneeId == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ La sesión perdió el developer asignado. Vuelve a ejecutar " + ADD_TASK_FORMAT + ".",
                            telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                Usuario assignee = usuarioRepository.findById(pendingAssigneeId)
                        .filter(this::isDeveloper)
                        .orElse(null);
                if (assignee == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ El developer seleccionado ya no está disponible. Intenta crear la tarea de nuevo.",
                            telegramClient, null);
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

                Long pendingProjectId = session.getPendingProjectId();
                if (pendingProjectId == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ La sesión perdió el proyecto seleccionado. Vuelve a ejecutar " + ADD_TASK_FORMAT + ".",
                            telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                Proyecto project = proyectoRepository.findById(pendingProjectId).orElse(null);
                if (project == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ El proyecto seleccionado ya no está disponible. Intenta crear la tarea otra vez.",
                            telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                Long pendingSprintId = session.getPendingSprintId();
                if (pendingSprintId == null) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "âŒ La sesiÃ³n perdiÃ³ el sprint seleccionado. Vuelve a ejecutar " + ADD_TASK_FORMAT + ".",
                            telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                Sprint sprintActivo = sprintRepository.findById(pendingSprintId).orElse(null);
                if (sprintActivo == null || sprintActivo.getProyecto() == null
                        || sprintActivo.getProyecto().getIdProyecto() == null
                        || !sprintActivo.getProyecto().getIdProyecto().equals(project.getIdProyecto())) {
                    BotHelper.sendMessageToTelegram(chatId,
                            "❌ No encontré un sprint para el proyecto " + project.getNombre()
                                    + ". Vuelve a ejecutar " + ADD_TASK_FORMAT + ".",
                            telegramClient, null);
                    sessionManager.clearSession(chatId);
                    return;
                }

                StringBuilder msgSuccess = new StringBuilder("✅ Hecho. Tareas registradas para ")
                        .append(formatDeveloperLabel(assignee)).append(" en ")
                        .append(project.getNombre()).append(" / ").append(sprintActivo.getNombre()).append(":\n");

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
                    d.setUsuarioAsignado(assignee);
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

    private Optional<AddTaskRequest> parseAddTaskRequest(String requestText) {
        String commandPayload = requestText
                .replaceFirst("(?i)^/addtask\\s*", "")
                .replaceFirst("(?i)^/additem\\s*", "")
                .trim();

        if (commandPayload.isBlank()) {
            return Optional.empty();
        }

        String[] parts = commandPayload.split("\\|", 2);
        if (parts.length < 2) {
            return Optional.empty();
        }

        String developerQuery = parts[0].trim();
        String taskDescription = parts[1].trim();
        if (developerQuery.isBlank() || taskDescription.isBlank()) {
            return Optional.empty();
        }

        return Optional.of(new AddTaskRequest(developerQuery, taskDescription));
    }

    private Optional<AddSprintRequest> parseAddSprintRequest(String requestText) {
        String commandPayload = requestText
                .replaceFirst("(?i)^/addsprint\\s*", "")
                .trim();

        if (commandPayload.isBlank()) {
            return Optional.empty();
        }

        String[] parts = commandPayload.split("\\|");
        if (parts.length < 4) {
            return Optional.empty();
        }

        String projectCode = parts[0].trim();
        String sprintName = parts[1].trim();
        String startDate = parts[2].trim();
        String endDate = parts[3].trim();
        if (projectCode.isBlank() || sprintName.isBlank() || startDate.isBlank() || endDate.isBlank()) {
            return Optional.empty();
        }

        return Optional.of(new AddSprintRequest(projectCode, sprintName, startDate, endDate));
    }

    private String formatDeveloperLabel(Usuario developer) {
        if (developer == null) {
            return "Developer desconocido";
        }

        String username = developer.getUsername();
        if (username == null || username.isBlank()) {
            return developer.getNombre() + " (ID " + developer.getIdUsuario() + ")";
        }
        return developer.getNombre() + " (@" + username + ")";
    }

    private Optional<List<Tarea>> tryBuildDraftsFromStructuredInput(String requestText) {
        String trimmed = requestText == null ? "" : requestText.trim();
        if (trimmed.isBlank()) {
            return Optional.empty();
        }

        try {
            if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                JsonNode jsonNode = objectMapper.readTree(trimmed);
                List<Tarea> drafts = buildDraftsFromJsonNode(jsonNode);
                if (!drafts.isEmpty()) {
                    return Optional.of(drafts);
                }
            }
        } catch (Exception ignored) {
            // If the message is not valid JSON we continue with text-based parsing.
        }

        Tarea textDraft = buildDraftFromStructuredText(trimmed);
        if (textDraft == null) {
            return Optional.empty();
        }

        List<Tarea> drafts = new ArrayList<>();
        drafts.add(textDraft);
        return Optional.of(drafts);
    }

    private Optional<List<Tarea>> tryBuildDraftsFromNaturalLanguage(String requestText) {
        String trimmed = requestText == null ? "" : requestText.trim();
        if (trimmed.isBlank()) {
            return Optional.empty();
        }

        Double horasEstimadas = extractEstimatedHours(trimmed);
        if (horasEstimadas == null) {
            return Optional.empty();
        }

        Long prioridadId = extractPriorityIdFromNaturalLanguage(trimmed);
        if (prioridadId == null) {
            prioridadId = 2L;
        }

        String cleanedName = trimTaskName(trimmed);
        if (cleanedName.isBlank()) {
            cleanedName = trimmed;
        }

        List<Tarea> drafts = splitNaturalLanguageTask(cleanedName, trimmed, horasEstimadas, prioridadId);
        return drafts.isEmpty() ? Optional.empty() : Optional.of(drafts);
    }

    private Optional<List<Tarea>> tryBuildDraftsFromClarification(String baseTaskDescription, String clarification) {
        String normalizedBase = baseTaskDescription == null ? "" : baseTaskDescription.trim();
        String normalizedClarification = clarification == null ? "" : clarification.trim();

        if (normalizedBase.isBlank() || normalizedClarification.isBlank()) {
            return Optional.empty();
        }

        Double horasEstimadas = extractEstimatedHours(normalizedClarification);
        if (horasEstimadas == null) {
            return Optional.empty();
        }

        Long prioridadId = extractPriorityIdFromNaturalLanguage(normalizedClarification);
        if (prioridadId == null) {
            prioridadId = parsePriorityIdFromStructuredHint(normalizedClarification);
        }
        if (prioridadId == null) {
            prioridadId = 2L;
        }

        String taskName = trimTaskName(normalizedBase);
        if (taskName.isBlank()) {
            taskName = normalizedBase;
        }

        List<Tarea> drafts = splitNaturalLanguageTask(taskName, normalizedBase, horasEstimadas, prioridadId);
        return drafts.isEmpty() ? Optional.empty() : Optional.of(drafts);
    }

    private List<Tarea> buildDraftsFromJsonNode(JsonNode rootNode) {
        List<Tarea> drafts = new ArrayList<>();
        if (rootNode == null || rootNode.isNull()) {
            return drafts;
        }

        if (rootNode.isArray()) {
            for (JsonNode jsonNode : rootNode) {
                Tarea draft = buildDraftFromJsonObject(jsonNode);
                if (draft != null) {
                    drafts.add(draft);
                }
            }
            return drafts;
        }

        Tarea draft = buildDraftFromJsonObject(rootNode);
        if (draft != null) {
            drafts.add(draft);
        }
        return drafts;
    }

    private Tarea buildDraftFromJsonObject(JsonNode jsonNode) {
        if (jsonNode == null || !jsonNode.isObject()) {
            return null;
        }

        Tarea draft = new Tarea();
        if (jsonNode.hasNonNull("nombre")) {
            draft.setNombre(jsonNode.get("nombre").asText());
        }
        if (jsonNode.hasNonNull("descripcion")) {
            draft.setDescripcion(jsonNode.get("descripcion").asText());
        }
        if (jsonNode.hasNonNull("horasEstimadas")) {
            draft.setHorasEstimadas(jsonNode.get("horasEstimadas").asDouble());
        }
        if (jsonNode.hasNonNull("idPrioridad")) {
            Prioridad prioridad = new Prioridad();
            prioridad.setIdPrioridad(jsonNode.get("idPrioridad").asLong());
            draft.setPrioridad(prioridad);
        }
        return draft;
    }

    private List<Tarea> splitNaturalLanguageTask(String taskName, String description, Double totalHours, Long priorityId) {
        List<Tarea> drafts = new ArrayList<>();
        double remainingHours = totalHours;
        int partIndex = 1;

        while (remainingHours > 0) {
            double currentHours = Math.min(remainingHours, 4.0d);
            Tarea draft = new Tarea();
            draft.setNombre(totalHours > 4 ? taskName + " (Parte " + partIndex + ")" : taskName);
            draft.setDescripcion(description);
            draft.setHorasEstimadas(currentHours);
            Prioridad prioridad = new Prioridad();
            prioridad.setIdPrioridad(priorityId);
            draft.setPrioridad(prioridad);
            drafts.add(draft);

            remainingHours -= currentHours;
            partIndex++;
        }

        return drafts;
    }

    private Tarea buildDraftFromStructuredText(String rawText) {
        String normalizedText = rawText.replace(",", "\n");
        String[] lines = normalizedText.split("\\r?\\n");

        String nombre = null;
        String descripcion = null;
        Double horasEstimadas = null;
        Long prioridadId = null;

        for (String line : lines) {
            String trimmedLine = line.trim();
            if (trimmedLine.isBlank()) {
                continue;
            }

            String lowerLine = trimmedLine.toLowerCase(Locale.ROOT);
            int separatorIndex = trimmedLine.indexOf(':');
            if (separatorIndex < 0) {
                continue;
            }

            String value = trimmedLine.substring(separatorIndex + 1).trim();
            if (value.isBlank()) {
                continue;
            }

            if (lowerLine.startsWith("nombre:")) {
                nombre = value;
            } else if (lowerLine.startsWith("descripcion:") || lowerLine.startsWith("descripción:")) {
                descripcion = value;
            } else if (lowerLine.startsWith("horas estimadas:") || lowerLine.startsWith("horas:")) {
                try {
                    horasEstimadas = Double.valueOf(value);
                } catch (NumberFormatException ignored) {
                    return null;
                }
            } else if (lowerLine.startsWith("prioridad:")) {
                prioridadId = parsePriorityId(value);
            }
        }

        if (nombre == null || horasEstimadas == null || prioridadId == null) {
            return null;
        }

        Tarea draft = new Tarea();
        draft.setNombre(nombre);
        draft.setDescripcion(descripcion != null ? descripcion : nombre);
        draft.setHorasEstimadas(horasEstimadas);
        Prioridad prioridad = new Prioridad();
        prioridad.setIdPrioridad(prioridadId);
        draft.setPrioridad(prioridad);
        return draft;
    }

    private Long parsePriorityId(String value) {
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        if ("1".equals(normalized) || "baja".equals(normalized) || "low".equals(normalized)) {
            return 1L;
        }
        if ("2".equals(normalized) || "media".equals(normalized) || "medium".equals(normalized)) {
            return 2L;
        }
        if ("3".equals(normalized) || "alta".equals(normalized) || "high".equals(normalized)) {
            return 3L;
        }
        return null;
    }

    private Long parsePriorityIdFromStructuredHint(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        Matcher matcher = Pattern.compile("prioridad\\s*:?\\s*(alta|media|baja|high|medium|low|1|2|3)")
                .matcher(normalized);
        if (matcher.find()) {
            return parsePriorityId(matcher.group(1));
        }
        return null;
    }

    private Double extractEstimatedHours(String text) {
        String normalized = text == null ? "" : text.toLowerCase(Locale.ROOT).replace(',', '.');
        Matcher matcher = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:horas?|hrs?|h)\\b").matcher(normalized);
        if (matcher.find()) {
            return Double.valueOf(matcher.group(1));
        }

        matcher = Pattern.compile("(?:tardar|tardar[aá]?|tomar[aá]?|estimo\\s+tardar)\\s+(\\d+(?:\\.\\d+)?)").matcher(normalized);
        if (matcher.find()) {
            return Double.valueOf(matcher.group(1));
        }

        return null;
    }

    private Long extractPriorityIdFromNaturalLanguage(String text) {
        String normalized = text == null ? "" : text.toLowerCase(Locale.ROOT);
        Matcher matcher = Pattern.compile("prioridad\\s*(?:nivel\\s*)?(alta|media|baja|high|medium|low|1|2|3)").matcher(normalized);
        if (matcher.find()) {
            return parsePriorityId(matcher.group(1));
        }

        if (normalized.contains(" prioridad alta") || normalized.endsWith("alta")) {
            return 3L;
        }
        if (normalized.contains(" prioridad media") || normalized.endsWith("media")) {
            return 2L;
        }
        if (normalized.contains(" prioridad baja") || normalized.endsWith("baja")) {
            return 1L;
        }
        return null;
    }

    private String trimTaskName(String text) {
        String cleaned = text == null ? "" : text;
        cleaned = cleaned.replaceAll("(?i)\\bprioridad\\s*(?:nivel\\s*)?(alta|media|baja|high|medium|low|1|2|3)\\b", "");
        cleaned = cleaned.replaceAll("(?i)\\b(estimo\\s+tardar|tardar[aá]?|tomar[aá]?|en)\\s+\\d+(?:[\\.,]\\d+)?\\s*(horas?|hrs?|h)?\\b", "");
        cleaned = cleaned.replaceAll("(?i)\\b\\d+(?:[\\.,]\\d+)?\\s*(horas?|hrs?|h)\\b", "");
        cleaned = cleaned.replaceAll("\\s{2,}", " ").trim();

        if (cleaned.endsWith(",") || cleaned.endsWith(".") || cleaned.endsWith(";")) {
            cleaned = cleaned.substring(0, cleaned.length() - 1).trim();
        }
        return cleaned;
    }

    private Sprint resolveSprintForProject(Proyecto project) {
        if (project == null || project.getIdProyecto() == null) {
            return null;
        }

        List<Sprint> projectSprints = sprintRepository.findByProyectoIdProyectoOrderByFechaInicioAsc(project.getIdProyecto());
        if (projectSprints.isEmpty()) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Sprint sprint : projectSprints) {
            if (sprint.getFechaInicio() != null && sprint.getFechaFin() != null
                    && !now.isBefore(sprint.getFechaInicio()) && !now.isAfter(sprint.getFechaFin())) {
                return sprint;
            }
        }

        return projectSprints.get(projectSprints.size() - 1);
    }

    private static class AddTaskRequest {
        private final String developerQuery;
        private final String taskDescription;

        private AddTaskRequest(String developerQuery, String taskDescription) {
            this.developerQuery = developerQuery;
            this.taskDescription = taskDescription;
        }

        public String developerQuery() {
            return developerQuery;
        }

        public String taskDescription() {
            return taskDescription;
        }
    }

    private static class AddSprintRequest {
        private final String projectCode;
        private final String sprintName;
        private final String startDate;
        private final String endDate;

        private AddSprintRequest(String projectCode, String sprintName, String startDate, String endDate) {
            this.projectCode = projectCode;
            this.sprintName = sprintName;
            this.startDate = startDate;
            this.endDate = endDate;
        }

        public String projectCode() {
            return projectCode;
        }

        public String sprintName() {
            return sprintName;
        }

        public String startDate() {
            return startDate;
        }

        public String endDate() {
            return endDate;
        }
    }
}
