package com.springboot.MyTodoList.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class JsonExtractionHelper {
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Extrae el contenido (content) del resultado JSON en bruto de DeepSeek API.
     * DeepSeek envía algo como {"choices":[{"message":{"content":"{...}"}}]}
     */
    public String extractInternalContent(String rawDeepSeekResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawDeepSeekResponse);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                String content = choices.get(0).path("message").path("content").asText();
                // Limpiar posibles bloques markdown "```json ... ```"
                content = content.replaceAll("```json", "").replaceAll("```", "").trim();
                return content;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "{}";
    }
}
