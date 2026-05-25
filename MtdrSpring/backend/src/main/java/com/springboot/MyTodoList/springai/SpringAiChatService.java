package com.springboot.MyTodoList.springai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class SpringAiChatService {

    private final ChatClient chatClient;

    public SpringAiChatService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String ask(String prompt) {
        String content = this.chatClient.prompt()
                .user(prompt)
                .call()
                .content();
        return content == null ? "" : content;
    }
}
