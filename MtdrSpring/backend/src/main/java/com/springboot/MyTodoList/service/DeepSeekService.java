package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class DeepSeekService {
    private static final int MAX_SEARCH_TERMS = 6;

    private final CloseableHttpClient httpClient;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String apiKey;
    private final String apiUrl;
    private final String chatModel;
    private final String embeddingModel;

    public DeepSeekService(CloseableHttpClient httpClient,
            JdbcTemplate jdbcTemplate,
            @Value("${deepseek.api.url}") String apiUrl,
            @Value("${deepseek.api.key}") String apiKey,
            @Value("${deepseek.chat.model:gemini-2.5-flash}") String chatModel,
            @Value("${deepseek.embedding.model:gemini-embedding-2}") String embeddingModel) {
        this.httpClient = httpClient;
        this.jdbcTemplate = jdbcTemplate;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
    }

    public String generateText(String prompt) throws IOException, org.apache.hc.core5.http.ParseException {
        HttpPost request = buildPost(apiUrl);
        JsonNode root = mapper.createObjectNode();
        ((com.fasterxml.jackson.databind.node.ObjectNode) root).put("model", chatModel);
        com.fasterxml.jackson.databind.node.ArrayNode messages = ((com.fasterxml.jackson.databind.node.ObjectNode) root)
                .putArray("messages");
        com.fasterxml.jackson.databind.node.ObjectNode msg = mapper.createObjectNode();
        msg.put("role", "user");
        msg.put("content", prompt);
        messages.add(msg);

        String requestBody = mapper.writeValueAsString(root);
        request.setEntity(new StringEntity(requestBody, org.apache.hc.core5.http.ContentType.APPLICATION_JSON));

        try (CloseableHttpResponse response = httpClient.execute(request)) {
            return EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
        }
    }

    public List<String> findRelevantToDoDescriptions(String query, int topK) {
        int limit = normalizeLimit(topK);
        List<String> terms = extractSearchTerms(query);
        if (terms.isEmpty()) {
            return findRecentToDoDescriptions(limit);
        }

        StringBuilder sql = new StringBuilder(
                "SELECT DESCRIPTION FROM TODOITEM WHERE DESCRIPTION IS NOT NULL AND (");
        for (int i = 0; i < terms.size(); i++) {
            if (i > 0) {
                sql.append(" OR ");
            }
            sql.append("LOWER(DESCRIPTION) LIKE ?");
        }
        sql.append(") ORDER BY ID DESC FETCH FIRST ").append(limit).append(" ROWS ONLY");

        List<Object> args = new ArrayList<>();
        for (String term : terms) {
            args.add("%" + term + "%");
        }

        try {
            return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> rs.getString("DESCRIPTION"), args.toArray());
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public String getEmbeddingModel() {
        return embeddingModel;
    }

    private List<String> findRecentToDoDescriptions(int limit) {
        String sql = "SELECT DESCRIPTION FROM TODOITEM WHERE DESCRIPTION IS NOT NULL ORDER BY ID DESC FETCH FIRST "
                + limit + " ROWS ONLY";
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("DESCRIPTION"));
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private int normalizeLimit(int requestedLimit) {
        if (requestedLimit <= 0) {
            return 3;
        }
        return Math.min(requestedLimit, 10);
    }

    private List<String> extractSearchTerms(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        Set<String> terms = new LinkedHashSet<>();
        for (String rawTerm : query.toLowerCase(Locale.ROOT).split("[^a-z0-9]+")) {
            String term = rawTerm.trim();
            if (term.length() >= 4 && !isStopWord(term)) {
                terms.add(term);
            }
            if (terms.size() >= MAX_SEARCH_TERMS) {
                break;
            }
        }
        return new ArrayList<>(terms);
    }

    private boolean isStopWord(String term) {
        return Pattern.matches(
                "(para|como|esta|este|esto|tarea|crear|agregar|addtask|hacer|debe|deben|sobre|con|una|unos|las|los|del|que|por)",
                term);
    }

    private HttpPost buildPost(String url) {
        HttpPost request = new HttpPost(url);
        request.addHeader("Content-Type", "application/json");
        request.addHeader("Authorization", "Bearer " + apiKey);
        return request;
    }
}
