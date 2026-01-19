using System.Text.Json;
using OpenAI.Chat;
using PromptChart.Models;

namespace PromptChart.Services;

public record IntentContext(
    Dictionary<string, DatasetMeta> Datasets,
    List<string> AvailableChartTypes
);

public record DatasetMeta(List<string> Metrics, List<string> Dimensions);

public interface ILLMProvider
{
    Task<ChartIntent> GenerateIntentAsync(string prompt, IntentContext context);
}

public class OpenAIProvider : ILLMProvider
{
    private const string SystemPrompt = """
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

        Use only metrics/dimensions from the chosen dataset. Choose appropriate chart types.
        """;

    private readonly ChatClient _client;

    public OpenAIProvider(string apiKey, string model = "gpt-4o-mini")
    {
        _client = new ChatClient(model, apiKey);
    }

    public async Task<ChartIntent> GenerateIntentAsync(string prompt, IntentContext context)
    {
        var datasetInfo = string.Join("\n", context.Datasets.Select(kv =>
            $"  {kv.Key}: metrics=[{string.Join(", ", kv.Value.Metrics)}], dimensions=[{string.Join(", ", kv.Value.Dimensions)}]"));

        var contextMsg = $"Available datasets:\n{datasetInfo}\nChart types: {string.Join(", ", context.AvailableChartTypes)}";

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(SystemPrompt),
            new UserChatMessage($"{contextMsg}\n\nRequest: {prompt}")
        };

        var options = new ChatCompletionOptions
        {
            MaxOutputTokenCount = 1000,
            Temperature = 0.1f,
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
        };

        var response = await _client.CompleteChatAsync(messages, options);
        var content = response.Value.Content[0].Text;

        if (string.IsNullOrEmpty(content))
            throw new Exception("No response from OpenAI");

        var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return JsonSerializer.Deserialize<ChartIntent>(content, jsonOptions)
            ?? throw new Exception("Failed to parse intent");
    }
}
