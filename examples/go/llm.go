package main

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	openai "github.com/sashabaranov/go-openai"
)

const systemPrompt = `You are a data visualization assistant. Convert natural language requests into JSON chart specifications.

Respond with valid JSON only:
{
  "dataset": string,
  "metrics": [{"field": string, "aggregation": "sum"|"avg"|"min"|"max"|"count"}],
  "dimensions": [{"field": string, "granularity": "day"|"week"|"month"|"quarter"|"year"}],
  "filters": [{"field": string, "operator": "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"in", "value": any}],
  "chartType": "bar"|"line"|"pie"|"doughnut"|"area"|"scatter",
  "title": string
}

Use only metrics/dimensions from the chosen dataset. Choose appropriate chart types.`

// LLMConfig holds configuration
type LLMConfig struct {
	APIKey   string
	Model    string
	MaxTokens int
}

// IntentContext provides context to the LLM
type IntentContext struct {
	Datasets           map[string]map[string][]string
	AvailableChartTypes []string
}

// LLMProvider interface
type LLMProvider interface {
	GenerateIntent(ctx context.Context, prompt string, intentCtx IntentContext) (ChartIntent, error)
}

// OpenAIProvider implements LLMProvider
type OpenAIProvider struct {
	client    *openai.Client
	model     string
	maxTokens int
}

// NewOpenAIProvider creates a new provider
func NewOpenAIProvider(config LLMConfig) *OpenAIProvider {
	model := config.Model
	if model == "" {
		model = "gpt-4o-mini"
	}
	maxTokens := config.MaxTokens
	if maxTokens == 0 {
		maxTokens = 1000
	}
	return &OpenAIProvider{
		client:    openai.NewClient(config.APIKey),
		model:     model,
		maxTokens: maxTokens,
	}
}

func (p *OpenAIProvider) GenerateIntent(ctx context.Context, prompt string, intentCtx IntentContext) (ChartIntent, error) {
	var datasetLines []string
	for name, meta := range intentCtx.Datasets {
		metrics := strings.Join(meta["metrics"], ", ")
		dimensions := strings.Join(meta["dimensions"], ", ")
		datasetLines = append(datasetLines, fmt.Sprintf("  %s: metrics=[%s], dimensions=[%s]", name, metrics, dimensions))
	}

	contextMsg := fmt.Sprintf("Available datasets:\n%s\nChart types: %s",
		strings.Join(datasetLines, "\n"),
		strings.Join(intentCtx.AvailableChartTypes, ", "))

	resp, err := p.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: p.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleSystem, Content: systemPrompt},
			{Role: openai.ChatMessageRoleUser, Content: contextMsg + "\n\nRequest: " + prompt},
		},
		MaxTokens: p.maxTokens,
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONObject,
		},
	})
	if err != nil {
		return ChartIntent{}, err
	}

	if len(resp.Choices) == 0 {
		return ChartIntent{}, fmt.Errorf("no response from OpenAI")
	}

	var intent ChartIntent
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &intent); err != nil {
		return ChartIntent{}, err
	}

	return intent, nil
}
