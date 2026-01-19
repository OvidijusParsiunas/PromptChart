package com.promptchart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("PromptChart backend running at http://localhost:" +
            System.getenv().getOrDefault("PORT", "3000"));
        System.out.println("API endpoint: POST http://localhost:" +
            System.getenv().getOrDefault("PORT", "3000") + "/api/chart");
    }
}
