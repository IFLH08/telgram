package com.springboot.MyTodoList.dto;

public interface SprintKpiDTO {
    Long getIdSprint();
    String getNombreSprint();
    Long getTotalTareas();
    Long getTareasCompletadas();
    Double getPorcentajeAvance();
}
