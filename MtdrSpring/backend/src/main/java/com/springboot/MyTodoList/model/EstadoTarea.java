package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "ESTADOS_TAREA")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class EstadoTarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ESTADO")
    private Long idEstado;

    @Column(name = "NOMBRE_ESTADO", length = 50, nullable = false, unique = true)
    private String nombreEstado;

    public EstadoTarea() {
    }

    public Long getIdEstado() {
        return idEstado;
    }

    public void setIdEstado(Long idEstado) {
        this.idEstado = idEstado;
    }

    public String getNombreEstado() {
        return nombreEstado;
    }

    public void setNombreEstado(String nombreEstado) {
        this.nombreEstado = nombreEstado;
    }
}
