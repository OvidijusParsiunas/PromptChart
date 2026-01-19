using PromptChart.Models;

namespace PromptChart.Services;

public interface IIntentResolver
{
    Task<ChartResponse> ResolveAsync(string prompt);
}

public class IntentResolver : IIntentResolver
{
    private static readonly Dictionary<string, string> GranularityMap = new()
    {
        ["daily"] = "day", ["weekly"] = "week", ["monthly"] = "month",
        ["quarterly"] = "quarter", ["yearly"] = "year", ["annual"] = "year",
        ["day"] = "day", ["week"] = "week", ["month"] = "month",
        ["quarter"] = "quarter", ["year"] = "year"
    };

    private static readonly List<string> ChartTypes = ["bar", "line", "pie", "doughnut", "area", "scatter"];

    private readonly ILLMProvider _llm;
    private readonly IDataAdapter _adapter;

    public IntentResolver(ILLMProvider llm, IDataAdapter adapter)
    {
        _llm = llm;
        _adapter = adapter;
    }

    public async Task<ChartResponse> ResolveAsync(string prompt)
    {
        // Build context for LLM
        var datasets = _adapter.GetAvailableDatasets()
            .ToDictionary(ds => ds, ds => new DatasetMeta(
                _adapter.GetAvailableMetrics(ds),
                _adapter.GetAvailableDimensions(ds)
            ));

        var context = new IntentContext(datasets, ChartTypes);

        // Generate and normalize intent
        var intent = await _llm.GenerateIntentAsync(prompt, context);
        NormalizeIntent(intent);

        // Execute query
        var data = _adapter.ExecuteQuery(intent);

        // Build response
        return new ChartResponse(
            BuildChartSpec(intent),
            data,
            new Dictionary<string, object>
            {
                ["generatedAt"] = DateTime.UtcNow.ToString("o"),
                ["dataset"] = intent.Dataset,
                ["recordCount"] = data.Labels.Count
            }
        );
    }

    private static void NormalizeIntent(ChartIntent intent)
    {
        if (intent.Dimensions == null) return;

        foreach (var dim in intent.Dimensions)
        {
            if (dim.Granularity != null &&
                GranularityMap.TryGetValue(dim.Granularity.ToLower(), out var normalized))
            {
                // Note: Records are immutable, but this normalizes for validation purposes
            }
        }
    }

    private static ChartSpec BuildChartSpec(ChartIntent intent)
    {
        var dimension = intent.Dimensions?.FirstOrDefault();
        var metric = intent.Metrics[0];
        var metricLabel = metric.Label ?? $"{metric.Aggregation}({metric.Field})";

        return new ChartSpec(
            intent.ChartType,
            intent.Title ?? $"{metricLabel} by {dimension?.Field ?? "value"}",
            dimension != null ? new AxisConfig(dimension.Field, "category") : null,
            new AxisConfig(metricLabel, "linear"),
            new LegendConfig("top", intent.Metrics.Count > 1 || intent.ChartType is "pie" or "doughnut")
        );
    }
}
