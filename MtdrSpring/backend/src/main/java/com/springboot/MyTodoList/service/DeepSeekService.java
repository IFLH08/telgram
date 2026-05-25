package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.springai.SpringAiChatService;
import org.springframework.stereotype.Service;

@Service
public class DeepSeekService {

    private final SpringAiChatService springAiChatService;

    public DeepSeekService(SpringAiChatService springAiChatService) {
        this.springAiChatService = springAiChatService;
    }

    public String generateText(String prompt) {
        return springAiChatService.ask(prompt);
    }
}
