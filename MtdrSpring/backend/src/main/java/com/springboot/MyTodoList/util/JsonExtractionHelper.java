package com.springboot.MyTodoList.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class JsonExtractionHelper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String extractInternalContent(String rawModelResponse) {
        String cleanedResponse = stripMarkdown(rawModelResponse);

        try {
            JsonNode root = objectMapper.readTree(cleanedResponse);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                String content = choices.get(0).path("message").path("content").asText();
                return stripMarkdown(content);
            }

            if (root.isArray() || root.isObject()) {
                return cleanedResponse;
            }
        } catch (Exception e) {
            return cleanedResponse;
        }

        return "{}";
    }

    private String stripMarkdown(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replaceAll("(?i)```json", "")
                .replaceAll("```", "")
                .trim();
    }
}
