using System.Text.Json.Serialization;

namespace PromptChart.Models;

public record ChartRequest(string Prompt);

public record ChartResponse(
    ChartSpec ChartSpec,
    ChartData Data,
    Dictionary<string, object>? Metadata = null
);

public record ChartSpec(
    string Type,
    string Title,
    AxisConfig? XAxis = null,
    AxisConfig? YAxis = null,
    LegendConfig? Legend = null
);

public record AxisConfig(string? Label = null, string? Type = null);

public record LegendConfig(string? Position = null, bool? Display = null);

public record ChartData(
    List<string> Labels,
    List<ChartDataset> Datasets
);

public record ChartDataset(
    string Label,
    List<double> Data,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    object? BackgroundColor = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    object? BorderColor = null,
    int BorderWidth = 1
);

public record ChartIntent(
    string Dataset,
    List<Metric> Metrics,
    List<Dimension>? Dimensions = null,
    List<Filter>? Filters = null,
    string ChartType = "bar",
    string? Title = null
);

public record Metric(
    string Field,
    string Aggregation,
    string? Label = null
);

public record Dimension(
    string Field,
    string? Granularity = null
);

public record Filter(
    string Field,
    string Operator,
    object Value
);
