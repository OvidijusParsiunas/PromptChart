package com.promptchart.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptchart.model.ChartIntent;
import com.theokanning.openai.completion.chat.*;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class OpenAIProvider implements LLMProvider {

    private static final String SYSTEM_PROMPT = """
        You are a data visualization assistant. Convert natural language requests into JSON chart specifications.

        Respond with valid JSON only:
        {
          "dataset": string,
          "metrics": [{"field": string, "aggregation": "sum"|"avg"|"min"|"max"|"count"}],
          "dimensions": [{"field": string, "granularity": "day"|"week"|"month"|"quarter"|"year"}],
          "filters": [{"field": string, "operator": "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"in", "value": any}],
          "chartType": "bar"|"line"|"pie"|"doughnut"|"area"|"scatter",
          "title": string
        }

        Use only metrics/dimensions from the chosen dataset. Choose appropriate chart types.""";

    private final OpenAiService service;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenAIProvider(
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.model}") String model) {
        this.service = new OpenAiService(apiKey);
        this.model = model;
    }

    @Override
    public ChartIntent generateIntent(String prompt, Map<String, Map<String, List<String>>> datasets, List<String> chartTypes) {
        var datasetInfo = datasets.entrySet().stream()
            .map(e -> "  " + e.getKey() + ": metrics=[" + String.join(", ", e.getValue().get("metrics")) +
                      "], dimensions=[" + String.join(", ", e.getValue().get("dimensions")) + "]")
            .collect(Collectors.joining("\n"));

        var contextMsg = "Available datasets:\n" + datasetInfo + "\nChart types: " + String.join(", ", chartTypes);

        var request = ChatCompletionRequest.builder()
            .model(model)
            .messages(List.of(
                new ChatMessage(ChatMessageRole.SYSTEM.value(), SYSTEM_PROMPT),
                new ChatMessage(ChatMessageRole.USER.value(), contextMsg + "\n\nRequest: " + prompt)
            ))
            .responseFormat(new ChatCompletionRequest.ChatCompletionRequestResponseFormat("json_object"))
            .maxTokens(1000)
            .temperature(0.1)
            .build();

        var response = service.createChatCompletion(request);
        var content = response.getChoices().get(0).getMessage().getContent();

        try {
            return objectMapper.readValue(content, ChartIntent.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM response", e);
        }
    }
}
