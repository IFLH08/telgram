package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "HISTORIAL_ACCIONES")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Kpi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ACCION")
    private Long idKpi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MEDIO")
    private Medio medio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SPRINT")
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TAREA")
    private Tarea tarea;

    @Column(name = "ACCION", length = 50)
    private String accion;

    public Kpi() {
    }

    public Long getIdKpi() {
        return idKpi;
    }

    public void setIdKpi(Long idKpi) {
        this.idKpi = idKpi;
    }

    public Medio getMedio() {
        return medio;
    }

    public void setMedio(Medio medio) {
        this.medio = medio;
    }

    public Sprint getSprint() {
        return sprint;
    }

    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    public Tarea getTarea() {
        return tarea;
    }

    public void setTarea(Tarea tarea) {
        this.tarea = tarea;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }
}
