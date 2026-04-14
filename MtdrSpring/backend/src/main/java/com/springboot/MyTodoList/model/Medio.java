package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "MEDIOS")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Medio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_MEDIO")
    private Long idMedio;

    @Column(name = "NOMBRE_MEDIO", length = 50, nullable = false, unique = true)
    private String nombreMedio;

    public Medio() {
    }

    public Long getIdMedio() {
        return idMedio;
    }

    public void setIdMedio(Long idMedio) {
        this.idMedio = idMedio;
    }

    public String getNombreMedio() {
        return nombreMedio;
    }

    public void setNombreMedio(String nombreMedio) {
        this.nombreMedio = nombreMedio;
    }
}
