package com.springboot.MyTodoList.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "RAG_DOCUMENTS", schema = "EQUIPO63")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class RagDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DOCUMENTO")
    private Long idDocumento;

    @Column(name = "TITULO", length = 200, nullable = false, unique = true)
    private String titulo;

    @Lob
    @Column(name = "CONTENIDO", nullable = false)
    private String contenido;

    @Lob
    @Column(name = "METADATA_JSON")
    private String metadataJson;

    @Lob
    @Column(name = "EMBEDDING_JSON", nullable = false)
    private String embeddingJson;

    @Column(name = "EMBEDDING_MODEL", length = 120, nullable = false)
    private String embeddingModel;

    @Column(name = "CREADO_EN", nullable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @Column(name = "ACTUALIZADO_EN", nullable = false)
    private OffsetDateTime actualizadoEn = OffsetDateTime.now();

    public Long getIdDocumento() {
        return idDocumento;
    }

    public void setIdDocumento(Long idDocumento) {
        this.idDocumento = idDocumento;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }

    public String getEmbeddingJson() {
        return embeddingJson;
    }

    public void setEmbeddingJson(String embeddingJson) {
        this.embeddingJson = embeddingJson;
    }

    public String getEmbeddingModel() {
        return embeddingModel;
    }

    public void setEmbeddingModel(String embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(OffsetDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public OffsetDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(OffsetDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }
}
