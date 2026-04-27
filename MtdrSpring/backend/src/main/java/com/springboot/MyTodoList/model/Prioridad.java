package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "PRIORIDADES")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Prioridad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRIORIDAD")
    private Long idPrioridad;

    @Column(name = "NOMBRE", length = 20, nullable = false, unique = true)
    private String nombre;

    public Prioridad() {
    }

    public Long getIdPrioridad() {
        return idPrioridad;
    }

    public void setIdPrioridad(Long idPrioridad) {
        this.idPrioridad = idPrioridad;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
