package com.springboot.MyTodoList.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AiTaskGenerationService {

    private final ChatClient chatClient;

    public AiTaskGenerationService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String generateTaskJson(String prompt) {
        String content = this.chatClient.prompt()
                .system("""
                        Eres un asistente de gestion de tareas para un backend Spring Boot.
                        Devuelve exclusivamente JSON valido, sin markdown ni explicaciones.
                        Respeta cualquier esquema, limite de horas y regla de negocio indicada por el usuario.
                        """)
                .user(prompt)
                .call()
                .content();
        return content == null ? "" : content;
    }
}
