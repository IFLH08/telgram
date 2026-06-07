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
        WAITING_FOR_PROJECT_CODE,
        WAITING_FOR_SPRINT_SELECTION,
        WAITING_FOR_MISSING_DATA,
        WAITING_FOR_CONFIRMATION,
        WAITING_FOR_REAL_HOURS
    }

    public static class UserSession {
        private State state = State.IDLE;
        private List<Tarea> draftTareas = new ArrayList<>();
        private String missingFieldsMessage = "";
        private Long pendingTaskId;
        private Long pendingAssigneeId;
        private String pendingAssigneeName = "";
        private String pendingTaskDescription = "";
        private Long pendingProjectId;
        private String pendingProjectCode = "";
        private String pendingProjectName = "";
        private Long pendingSprintId;
        private String pendingSprintName = "";

        public State getState() { return state; }
        public void setState(State state) { this.state = state; }

        public List<Tarea> getDraftTareas() { return draftTareas; }
        public void setDraftTareas(List<Tarea> draftTareas) { this.draftTareas = draftTareas; }

        public String getMissingFieldsMessage() { return missingFieldsMessage; }
        public void setMissingFieldsMessage(String missingFieldsMessage) { this.missingFieldsMessage = missingFieldsMessage; }

        public Long getPendingTaskId() { return pendingTaskId; }
        public void setPendingTaskId(Long pendingTaskId) { this.pendingTaskId = pendingTaskId; }

        public Long getPendingAssigneeId() { return pendingAssigneeId; }
        public void setPendingAssigneeId(Long pendingAssigneeId) { this.pendingAssigneeId = pendingAssigneeId; }

        public String getPendingAssigneeName() { return pendingAssigneeName; }
        public void setPendingAssigneeName(String pendingAssigneeName) { this.pendingAssigneeName = pendingAssigneeName; }

        public String getPendingTaskDescription() { return pendingTaskDescription; }
        public void setPendingTaskDescription(String pendingTaskDescription) { this.pendingTaskDescription = pendingTaskDescription; }

        public Long getPendingProjectId() { return pendingProjectId; }
        public void setPendingProjectId(Long pendingProjectId) { this.pendingProjectId = pendingProjectId; }

        public String getPendingProjectCode() { return pendingProjectCode; }
        public void setPendingProjectCode(String pendingProjectCode) { this.pendingProjectCode = pendingProjectCode; }

        public String getPendingProjectName() { return pendingProjectName; }
        public void setPendingProjectName(String pendingProjectName) { this.pendingProjectName = pendingProjectName; }

        public Long getPendingSprintId() { return pendingSprintId; }
        public void setPendingSprintId(Long pendingSprintId) { this.pendingSprintId = pendingSprintId; }

        public String getPendingSprintName() { return pendingSprintName; }
        public void setPendingSprintName(String pendingSprintName) { this.pendingSprintName = pendingSprintName; }
    }

    private final Map<Long, UserSession> sessions = new HashMap<>();

    public UserSession getSession(Long chatId) {
        return sessions.computeIfAbsent(chatId, k -> new UserSession());
    }

    public void clearSession(Long chatId) {
        sessions.remove(chatId);
    }
}
