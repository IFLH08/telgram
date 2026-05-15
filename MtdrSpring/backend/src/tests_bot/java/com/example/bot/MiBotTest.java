package com.example.bot;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.controller.ToDoItemBotController;
import com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO;
import com.springboot.MyTodoList.model.EstadoTarea;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.EstadoTareaRepository;
import com.springboot.MyTodoList.repository.PrioridadRepository;
import com.springboot.MyTodoList.repository.RolRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TareaRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import com.springboot.MyTodoList.service.ConversationalBotService;
import com.springboot.MyTodoList.service.DashboardMetricsService;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.JsonExtractionHelper;
import com.springboot.MyTodoList.util.SessionManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.message.Message;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MiBotTest {

    private static final long CHAT_ID = 1337L;

    @Mock
    private TelegramClient telegramClient;

    @Mock
    private DeepSeekService deepSeekService;

    @Mock
    private TareaRepository tareaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EstadoTareaRepository estadoTareaRepository;

    @Mock
    private PrioridadRepository prioridadRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private DashboardMetricsService dashboardMetricsService;

    @Mock
    private ConversationalBotService conversationalBotService;

    private ConversationalBotService botService;

    @BeforeEach
    void setUp() {
        botService = new ConversationalBotService(
                telegramClient,
                deepSeekService,
                new SessionManager(),
                new JsonExtractionHelper(),
                tareaRepository,
                usuarioRepository,
                estadoTareaRepository,
                prioridadRepository,
                rolRepository,
                sprintRepository,
                dashboardMetricsService);
    }

    @Test
    void consumeDelegatesTelegramTextMessagesToConversationalService() {
        ToDoItemBotController botController = new ToDoItemBotController(botProps(), deepSeekService,
                conversationalBotService);
        Update update = updateWithText("/start");

        botController.consume(update);

        verify(conversationalBotService).processMessage(CHAT_ID, "/start");
    }

    @Test
    void consumeIgnoresUpdatesWithoutText() {
        ToDoItemBotController botController = new ToDoItemBotController(botProps(), deepSeekService,
                conversationalBotService);
        Update update = new Update();

        botController.consume(update);

        verify(conversationalBotService, never()).processMessage(any(), any());
    }

    @Test
    void startCommandShowsMainMenu() throws Exception {
        botService.processMessage(CHAT_ID, "/start");

        SendMessage message = captureLastTelegramMessage();
        assertEquals(String.valueOf(CHAT_ID), message.getChatId());
        assertTrue(message.getText().contains("Hola. Soy tu asistente de proyectos."));
        assertNotNull(message.getReplyMarkup());
    }

    @Test
    void addNewItemButtonExplainsAddTaskCommand() throws Exception {
        botService.processMessage(CHAT_ID, BotLabels.ADD_NEW_ITEM.getLabel());

        SendMessage message = captureLastTelegramMessage();
        assertTrue(message.getText().contains("/AddTask"));
    }

    @Test
    void unknownCommandReturnsHelpMessage() throws Exception {
        botService.processMessage(CHAT_ID, "comando inexistente");

        SendMessage message = captureLastTelegramMessage();
        assertTrue(message.getText().contains("Comando no reconocido"));
    }

    @Test
    void listAllItemsCreatesTelegramUserAndReportsWhenThereAreNoActiveTasks() throws Exception {
        Usuario user = new Usuario();
        user.setIdUsuario(1L);
        user.setTelegramId(CHAT_ID);
        user.setNombre("Telegram User " + CHAT_ID);
        user.setUsername("telegram_" + CHAT_ID);

        when(usuarioRepository.findByTelegramId(CHAT_ID)).thenReturn(Optional.empty());
        when(usuarioRepository.findMaxIdUsuario()).thenReturn(0L);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(user);
        when(tareaRepository.findByUsuarioAsignadoIdUsuario(1L)).thenReturn(List.of());

        botService.processMessage(CHAT_ID, BotLabels.LIST_ALL_ITEMS.getLabel());

        SendMessage message = captureLastTelegramMessage();
        assertTrue(message.getText().contains("No tienes tareas activas"));
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void iniciarTaskMarksTaskAsInProgress() throws Exception {
        Tarea task = new Tarea();
        task.setIdTarea(10L);
        EstadoTarea inProgress = new EstadoTarea();
        inProgress.setNombreEstado("En progreso");

        when(tareaRepository.findById(10L)).thenReturn(Optional.of(task));
        when(estadoTareaRepository.findByNombreEstado("En progreso")).thenReturn(inProgress);
        when(tareaRepository.save(task)).thenReturn(task);
        when(usuarioRepository.findByTelegramId(CHAT_ID)).thenReturn(Optional.of(usuario(1L)));
        when(tareaRepository.findByUsuarioAsignadoIdUsuario(1L)).thenReturn(List.of());

        botService.processMessage(CHAT_ID, "10-INICIAR");

        assertEquals("En progreso", task.getEstado().getNombreEstado());
        verify(tareaRepository).save(task);
        assertTrue(captureFirstTelegramMessage().getText().contains("marcada como INICIADA"));
    }

    @Test
    void kpiTasksCommandSendsDashboardMetrics() throws Exception {
        when(dashboardMetricsService.getSprintDeveloperMetrics()).thenReturn(List.of(
                new DashboardSprintDeveloperMetricDTO(1L, "Sprint 1", 7L, "Ada", 3L, 8.5)));

        botService.processMessage(CHAT_ID, "/kpi_tasks");

        SendMessage message = captureLastTelegramMessage();
        assertTrue(message.getText().contains("KPI Tasks completed by user/sprint"));
        assertTrue(message.getText().contains("Ada: 3 tasks"));
    }

    private BotProps botProps() {
        BotProps props = new BotProps();
        props.setName("test-bot");
        props.setToken("000000:test-token");
        return props;
    }

    private Update updateWithText(String text) {
        Update update = org.mockito.Mockito.mock(Update.class);
        Message message = org.mockito.Mockito.mock(Message.class);
        when(update.hasMessage()).thenReturn(true);
        when(update.getMessage()).thenReturn(message);
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn(text);
        when(message.getChatId()).thenReturn(CHAT_ID);
        return update;
    }

    private Usuario usuario(Long id) {
        Usuario user = new Usuario();
        user.setIdUsuario(id);
        user.setTelegramId(CHAT_ID);
        user.setNombre("Ada");
        user.setUsername("ada");
        return user;
    }

    private SendMessage captureFirstTelegramMessage() throws Exception {
        return captureTelegramMessages().getAllValues().get(0);
    }

    private SendMessage captureLastTelegramMessage() throws Exception {
        List<SendMessage> messages = captureTelegramMessages().getAllValues();
        return messages.get(messages.size() - 1);
    }

    private ArgumentCaptor<SendMessage> captureTelegramMessages() throws Exception {
        ArgumentCaptor<SendMessage> captor = ArgumentCaptor.forClass(SendMessage.class);
        verify(telegramClient, org.mockito.Mockito.atLeastOnce()).execute(captor.capture());
        return captor;
    }
}
