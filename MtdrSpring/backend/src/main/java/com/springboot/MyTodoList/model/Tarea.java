package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "TAREAS")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TAREA")
    private Long idTarea;

    @Column(name = "NOMBRE", length = 200, nullable = false)
    private String nombre;

    @Column(name = "DESCRIPCION", length = 500)
    private String descripcion;

    @Column(name = "FECHA_CREACION", nullable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    @Column(name = "FECHA_ENTREGA")
    private OffsetDateTime fechaEntrega;

    @Column(name = "HORAS_ESTIMADAS")
    private Double horasEstimadas;

    @Column(name = "PUNTOS_HISTORIA")
    private Integer puntosHistoria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_ESTADO")
    private EstadoTarea estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SPRINT", nullable = false)
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_USUARIO_ASIGNADO")
    private Usuario usuarioAsignado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_PRIORIDAD")
    private Prioridad prioridad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DELETED_BY")
    private Usuario deletedBy;

    @Column(name = "ELIMINADA", nullable = false)
    private Boolean eliminada = false;

    @Column(name = "FECHA_ELIMINACION")
    private OffsetDateTime fechaEliminacion;

    @Column(name = "HORAS_REALES")
    private Double horasReales;

    public Tarea() {
    }

    public Long getIdTarea() {
        return idTarea;
    }

    public void setIdTarea(Long idTarea) {
        this.idTarea = idTarea;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(OffsetDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public OffsetDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(OffsetDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public Double getHorasEstimadas() {
        return horasEstimadas;
    }

    public void setHorasEstimadas(Double horasEstimadas) {
        this.horasEstimadas = horasEstimadas;
    }

    public Integer getPuntosHistoria() {
        return puntosHistoria;
    }

    public void setPuntosHistoria(Integer puntosHistoria) {
        this.puntosHistoria = puntosHistoria;
    }

    public EstadoTarea getEstado() {
        return estado;
    }

    public void setEstado(EstadoTarea estado) {
        this.estado = estado;
    }

    public Sprint getSprint() {
        return sprint;
    }

    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    public Usuario getUsuarioAsignado() {
        return usuarioAsignado;
    }

    public void setUsuarioAsignado(Usuario usuarioAsignado) {
        this.usuarioAsignado = usuarioAsignado;
    }

    public Prioridad getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(Prioridad prioridad) {
        this.prioridad = prioridad;
    }

    public Usuario getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(Usuario deletedBy) {
        this.deletedBy = deletedBy;
    }

    public Boolean getEliminada() {
        return eliminada;
    }

    public void setEliminada(Boolean eliminada) {
        this.eliminada = eliminada;
    }

    public OffsetDateTime getFechaEliminacion() {
        return fechaEliminacion;
    }

    public void setFechaEliminacion(OffsetDateTime fechaEliminacion) {
        this.fechaEliminacion = fechaEliminacion;
    }

    public Double getHorasReales() {
        return horasReales;
    }

    public void setHorasReales(Double horasReales) {
        this.horasReales = horasReales;
    }
}
