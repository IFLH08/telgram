package com.springboot.MyTodoList.springai;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/spring-ai")
public class SpringAiController {

    private final SpringAiChatService springAiChatService;

    public SpringAiController(SpringAiChatService springAiChatService) {
        this.springAiChatService = springAiChatService;
    }

    @GetMapping("/ask")
    public Map<String, String> ask(
            @RequestParam(defaultValue = "Explica brevemente que es Spring AI") String prompt
    ) {
        return Map.of("response", springAiChatService.ask(prompt));
    }
}