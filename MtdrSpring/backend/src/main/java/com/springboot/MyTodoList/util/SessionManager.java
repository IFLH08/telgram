package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.Tarea;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gestor de sesiones para recordar el estado de navegación de cada usuario en el Bot de Telegram.
 */
@Component
public class SessionManager {

    public enum State {
        IDLE,
        WAITING_FOR_MISSING_DATA,
        WAITING_FOR_CONFIRMATION
    }

    public static class UserSession {
        private State state = State.IDLE;
        private List<Tarea> draftTareas = new ArrayList<>();
        private String missingFieldsMessage = "";

        public State getState() { return state; }
        public void setState(State state) { this.state = state; }

        public List<Tarea> getDraftTareas() { return draftTareas; }
        public void setDraftTareas(List<Tarea> draftTareas) { this.draftTareas = draftTareas; }

        public String getMissingFieldsMessage() { return missingFieldsMessage; }
        public void setMissingFieldsMessage(String missingFieldsMessage) { this.missingFieldsMessage = missingFieldsMessage; }
    }

    private final Map<Long, UserSession> sessions = new HashMap<>();

    public UserSession getSession(Long chatId) {
        return sessions.computeIfAbsent(chatId, k -> new UserSession());
    }

    public void clearSession(Long chatId) {
        sessions.remove(chatId);
    }
}
