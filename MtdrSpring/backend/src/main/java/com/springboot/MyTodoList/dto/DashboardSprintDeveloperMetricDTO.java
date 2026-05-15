package com.springboot.MyTodoList.dto;

public class DashboardSprintDeveloperMetricDTO {
    private final Long sprintId;
    private final String sprintName;
    private final Long developerId;
    private final String developerName;
    private final Long completedTasks;
    private final Double realHours;

    public DashboardSprintDeveloperMetricDTO(
            Long sprintId,
            String sprintName,
            Long developerId,
            String developerName,
            Long completedTasks,
            Double realHours) {
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.developerId = developerId;
        this.developerName = developerName;
        this.completedTasks = completedTasks != null ? completedTasks : 0L;
        this.realHours = realHours != null ? realHours : 0.0;
    }

    public Long getSprintId() {
        return sprintId;
    }

    public String getSprintName() {
        return sprintName;
    }

    public Long getDeveloperId() {
        return developerId;
    }

    public String getDeveloperName() {
        return developerName;
    }

    public Long getCompletedTasks() {
        return completedTasks;
    }

    public Double getRealHours() {
        return realHours;
    }
}
