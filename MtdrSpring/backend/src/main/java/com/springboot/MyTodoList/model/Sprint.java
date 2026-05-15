package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "SPRINTS", schema = "EQUIPO63")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Sprint {
    @Id
    @Column(name = "ID_SPRINT")
    private Long idSprint;

    @Column(name = "NOMBRE", length = 50, nullable = false)
    private String nombre;

    @Column(name = "FECHA_INICIO")
    private LocalDateTime fechaInicio;

    @Column(name = "FECHA_FIN")
    private LocalDateTime fechaFin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_PROYECTO", nullable = false)
    private Proyecto proyecto;

    public Sprint() {
    }

    public Long getIdSprint() {
        return idSprint;
    }

    public void setIdSprint(Long idSprint) {
        this.idSprint = idSprint;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Proyecto getProyecto() {
        return proyecto;
    }

    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }
}
