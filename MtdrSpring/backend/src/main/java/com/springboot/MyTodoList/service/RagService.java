package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.model.RagDocument;
import com.springboot.MyTodoList.repository.RagDocumentRepository;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class RagService {
    private static final int FALLBACK_DIMENSIONS = 128;
    private static final int DEFAULT_TOP_K = 3;

    private final RagDocumentRepository ragDocumentRepository;
    private final DeepSeekService deepSeekService;
    private final ObjectProvider<EmbeddingModel> embeddingModelProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${rag.embedding.model:${SPRING_AI_OPENAI_CHAT_MODEL:local-hash-embedding-v1}}")
    private String embeddingModelName;

    @Value("${rag.seed.enabled:true}")
    private boolean seedEnabled;

    public RagService(
            RagDocumentRepository ragDocumentRepository,
            DeepSeekService deepSeekService,
            ObjectProvider<EmbeddingModel> embeddingModelProvider) {
        this.ragDocumentRepository = ragDocumentRepository;
        this.deepSeekService = deepSeekService;
        this.embeddingModelProvider = embeddingModelProvider;
    }

    public String answerQuestion(String question) {
        String cleanQuestion = question == null ? "" : question.trim();
        if (cleanQuestion.isBlank()) {
            return "Escribe una pregunta despues de /rag. Ejemplo: /rag como completo una tarea con horas reales";
        }

        ensureSeedDocuments();

        List<RagContextChunk> chunks = retrieve(cleanQuestion, DEFAULT_TOP_K);
        if (chunks.isEmpty()) {
            return "No hay documentos RAG disponibles en Oracle para responder.";
        }

        String prompt = buildPrompt(cleanQuestion, chunks);
        String generated = deepSeekService.generateText(prompt).trim();
        if (generated.isBlank()) {
            generated = "No pude generar una respuesta con el modelo configurado.";
        }

        return generated + "\n\nFuentes RAG:\n" + formatSources(chunks);
    }

    public synchronized void ensureSeedDocuments() {
        if (!seedEnabled || ragDocumentRepository.count() > 0) {
            return;
        }

        saveSeedDocument(
                "Flujo P0 de tareas",
                "La demo final debe mostrar login, creacion de tarea desde plataforma, asignacion a un developer, visibilidad de la tarea en el chatbot, cierre de la tarea con horas reales y dashboard actualizado con KPIs reales.",
                "{\"source\":\"seed\",\"area\":\"task-flow\"}");
        saveSeedDocument(
                "Dashboard KPIs reales",
                "El dashboard consume /api/dashboard/sprint-developer-metrics y debe soportar todos los sprints, todos los developers y un developer especifico. Los KPIs obligatorios son completed tasks, total real hours y comparacion entre developers. Los sprints incluidos llegan hasta el 11 de junio de 2026 inclusive.",
                "{\"source\":\"seed\",\"area\":\"dashboard\"}");
        saveSeedDocument(
                "Chatbot demo",
                "El bot debe soportar create task, list tasks y complete task. El listado solo debe mostrar tareas Pendiente, En progreso o Completada. Para completar una tarea, el developer debe capturar horas reales y ese valor manual es la fuente de verdad.",
                "{\"source\":\"seed\",\"area\":\"chatbot\"}");
        saveSeedDocument(
                "RAG obligatorio",
                "El feature de IA demostrable usa RAG en el chatbot. Los documentos y embeddings se guardan en Oracle en RAG_DOCUMENTS; la recuperacion trae contexto antes de generar la respuesta con el modelo principal configurado.",
                "{\"source\":\"seed\",\"area\":\"rag\"}");
    }

    private void saveSeedDocument(String title, String content, String metadataJson) {
        if (ragDocumentRepository.existsByTitulo(title)) {
            return;
        }

        RagDocument document = new RagDocument();
        document.setTitulo(title);
        document.setContenido(content);
        document.setMetadataJson(metadataJson);
        document.setEmbeddingJson(toJson(embed(content)));
        document.setEmbeddingModel(embeddingModelName);
        document.setCreadoEn(OffsetDateTime.now());
        document.setActualizadoEn(OffsetDateTime.now());
        ragDocumentRepository.save(document);
    }

    private List<RagContextChunk> retrieve(String question, int limit) {
        double[] questionEmbedding = embed(question);
        List<RagContextChunk> scored = new ArrayList<>();

        for (RagDocument document : ragDocumentRepository.findAllByOrderByActualizadoEnDesc()) {
            double[] documentEmbedding = fromJson(document.getEmbeddingJson());
            if (documentEmbedding.length == 0) {
                continue;
            }

            double score = cosine(questionEmbedding, documentEmbedding)
                    + lexicalBonus(question, document.getTitulo() + " " + document.getContenido());
            scored.add(new RagContextChunk(document, score));
        }

        return scored.stream()
                .sorted(Comparator.comparingDouble(RagContextChunk::score).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    private String buildPrompt(String question, List<RagContextChunk> chunks) {
        StringBuilder context = new StringBuilder();
        for (int index = 0; index < chunks.size(); index++) {
            RagDocument document = chunks.get(index).document();
            context.append("[")
                    .append(index + 1)
                    .append("] ")
                    .append(document.getTitulo())
                    .append("\n")
                    .append(document.getContenido())
                    .append("\n\n");
        }

        return """
                Responde en espanol usando solo el contexto RAG proporcionado.
                Si el contexto no alcanza, dilo claramente y no inventes detalles.
                Incluye pasos concretos cuando la pregunta sea operativa.

                Contexto:
                %s

                Pregunta:
                %s
                """.formatted(context, question);
    }

    private String formatSources(List<RagContextChunk> chunks) {
        StringBuilder sources = new StringBuilder();
        for (int index = 0; index < chunks.size(); index++) {
            RagContextChunk chunk = chunks.get(index);
            RagDocument document = chunk.document();
            sources.append("- [")
                    .append(index + 1)
                    .append("] ")
                    .append(document.getTitulo())
                    .append(" (score ")
                    .append(String.format(Locale.US, "%.3f", chunk.score()))
                    .append(")\n");
        }
        return sources.toString().trim();
    }

    private double[] embed(String text) {
        EmbeddingModel embeddingModel = embeddingModelProvider.getIfAvailable();
        if (embeddingModel != null) {
            try {
                float[] vector = embeddingModel.embed(text);
                if (vector != null && vector.length > 0) {
                    double[] converted = new double[vector.length];
                    for (int index = 0; index < vector.length; index++) {
                        converted[index] = vector[index];
                    }
                    return normalize(converted);
                }
            } catch (RuntimeException ignored) {
                // Algunos proveedores OpenAI-compatible no exponen embeddings; usamos fallback estable.
            }
        }

        return fallbackEmbedding(text);
    }

    private double[] fallbackEmbedding(String text) {
        double[] vector = new double[FALLBACK_DIMENSIONS];
        for (String token : tokenize(text)) {
            int hash = token.hashCode();
            int index = Math.floorMod(hash, FALLBACK_DIMENSIONS);
            vector[index] += (hash & 1) == 0 ? 1.0 : -1.0;
        }
        return normalize(vector);
    }

    private List<String> tokenize(String text) {
        String normalized = Normalizer.normalize(text == null ? "" : text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
        String[] parts = normalized.split("[^a-z0-9]+");
        List<String> tokens = new ArrayList<>();
        for (String part : parts) {
            if (part.length() >= 3) {
                tokens.add(part);
            }
        }
        return tokens;
    }

    private double lexicalBonus(String question, String content) {
        List<String> questionTokens = tokenize(question);
        if (questionTokens.isEmpty()) {
            return 0.0;
        }

        List<String> contentTokens = tokenize(content);
        long overlap = questionTokens.stream().filter(contentTokens::contains).count();
        return Math.min(0.25, overlap / (double) questionTokens.size() * 0.25);
    }

    private double cosine(double[] left, double[] right) {
        int length = Math.min(left.length, right.length);
        if (length == 0) {
            return 0.0;
        }

        double dot = 0.0;
        double leftNorm = 0.0;
        double rightNorm = 0.0;
        for (int index = 0; index < length; index++) {
            dot += left[index] * right[index];
            leftNorm += left[index] * left[index];
            rightNorm += right[index] * right[index];
        }
        if (leftNorm == 0.0 || rightNorm == 0.0) {
            return 0.0;
        }
        return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
    }

    private double[] normalize(double[] vector) {
        double norm = 0.0;
        for (double value : vector) {
            norm += value * value;
        }
        if (norm == 0.0) {
            return vector;
        }
        double divisor = Math.sqrt(norm);
        double[] normalized = new double[vector.length];
        for (int index = 0; index < vector.length; index++) {
            normalized[index] = vector[index] / divisor;
        }
        return normalized;
    }

    private String toJson(double[] vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("No se pudo serializar el embedding RAG.", error);
        }
    }

    private double[] fromJson(String json) {
        try {
            return objectMapper.readValue(json, double[].class);
        } catch (Exception error) {
            return new double[0];
        }
    }

    private record RagContextChunk(RagDocument document, double score) {
    }
}
