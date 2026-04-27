package com.springboot.MyTodoList.dto;

public class SprintKpiResponse {
    private Long idSprint;
    private String nombreSprint;
    private Long totalTareas;
    private Long tareasCompletadas;
    private Double porcentajeAvance;

    public SprintKpiResponse(Long idSprint, String nombreSprint, Long totalTareas, Long tareasCompletadas) {
        this.idSprint = idSprint;
        this.nombreSprint = nombreSprint;
        this.totalTareas = totalTareas != null ? totalTareas : 0L;
        this.tareasCompletadas = tareasCompletadas != null ? tareasCompletadas : 0L;
        
        if (this.totalTareas == 0) {
            this.porcentajeAvance = 0.0;
        } else {
            this.porcentajeAvance = Math.round(((double) this.tareasCompletadas / this.totalTareas) * 10000.0) / 100.0;
        }
    }

    public Long getIdSprint() { return idSprint; }
    public String getNombreSprint() { return nombreSprint; }
    public Long getTotalTareas() { return totalTareas; }
    public Long getTareasCompletadas() { return tareasCompletadas; }
    public Double getPorcentajeAvance() { return porcentajeAvance; }
}
