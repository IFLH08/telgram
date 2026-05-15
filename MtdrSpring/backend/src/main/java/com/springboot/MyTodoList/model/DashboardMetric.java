package com.springboot.MyTodoList.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "DASHBOARD_METRICS", schema = "EQUIPO63")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class DashboardMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_METRICA")
    private Long idMetrica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PROYECTO", nullable = false)
    private Proyecto proyecto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SPRINT")
    private Sprint sprint;

    @Column(name = "NOMBRE_KPI", length = 100, nullable = false)
    private String nombreKpi;

    @Column(name = "VALOR", nullable = false)
    private Double valor;

    @Column(name = "FECHA_CALCULO", nullable = false)
    private OffsetDateTime fechaCalculo = OffsetDateTime.now();

    public DashboardMetric() {
    }

    public Long getIdMetrica() {
        return idMetrica;
    }

    public void setIdMetrica(Long idMetrica) {
        this.idMetrica = idMetrica;
    }

    public Proyecto getProyecto() {
        return proyecto;
    }

    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }

    public Sprint getSprint() {
        return sprint;
    }

    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    public String getNombreKpi() {
        return nombreKpi;
    }

    public void setNombreKpi(String nombreKpi) {
        this.nombreKpi = nombreKpi;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public OffsetDateTime getFechaCalculo() {
        return fechaCalculo;
    }

    public void setFechaCalculo(OffsetDateTime fechaCalculo) {
        this.fechaCalculo = fechaCalculo;
    }
}
