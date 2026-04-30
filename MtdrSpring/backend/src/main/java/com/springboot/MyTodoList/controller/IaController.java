package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.util.JsonExtractionHelper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ia")
public class IaController {
    private final DeepSeekService deepSeekService;
    private final JsonExtractionHelper jsonExtractionHelper;

    public IaController(DeepSeekService deepSeekService, JsonExtractionHelper jsonExtractionHelper) {
        this.deepSeekService = deepSeekService;
        this.jsonExtractionHelper = jsonExtractionHelper;
    }

    @PostMapping("/generar")
    public ResponseEntity<?> generar(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");

        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El prompt es obligatorio."));
        }

        try {
            String rawResponse = deepSeekService.generateText(prompt);
            String texto = jsonExtractionHelper.extractInternalContent(rawResponse);
            return ResponseEntity.ok(Map.of("texto", texto));
        } catch (Exception error) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "No se pudo generar contenido con IA."));
        }
    }
}
