using PromptChart.Models;

namespace PromptChart.Services;

public interface IDataAdapter
{
    List<string> GetAvailableDatasets();
    List<string> GetAvailableMetrics(string dataset);
    List<string> GetAvailableDimensions(string dataset);
    ChartData ExecuteQuery(ChartIntent intent);
}

public class MockDataAdapter : IDataAdapter
{
    private static readonly string[] Colors = [
        "rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)", "rgba(239, 68, 68, 0.8)",
        "rgba(139, 92, 246, 0.8)", "rgba(236, 72, 153, 0.8)"
    ];

    private static readonly string[] BorderColors = [
        "rgba(59, 130, 246, 1)", "rgba(16, 185, 129, 1)",
        "rgba(245, 158, 11, 1)", "rgba(239, 68, 68, 1)",
        "rgba(139, 92, 246, 1)", "rgba(236, 72, 153, 1)"
    ];

    private static readonly Dictionary<string, List<Dictionary<string, object>>> MockData = new()
    {
        ["sales"] = [
            new() { ["month"] = "Jan", ["region"] = "North", ["amount"] = 45000.0, ["quantity"] = 120.0, ["revenue"] = 45000.0 },
            new() { ["month"] = "Jan", ["region"] = "South", ["amount"] = 38000.0, ["quantity"] = 95.0, ["revenue"] = 38000.0 },
            new() { ["month"] = "Feb", ["region"] = "North", ["amount"] = 52000.0, ["quantity"] = 140.0, ["revenue"] = 52000.0 },
            new() { ["month"] = "Feb", ["region"] = "South", ["amount"] = 41000.0, ["quantity"] = 105.0, ["revenue"] = 41000.0 },
            new() { ["month"] = "Mar", ["region"] = "North", ["amount"] = 48000.0, ["quantity"] = 130.0, ["revenue"] = 48000.0 },
            new() { ["month"] = "Mar", ["region"] = "South", ["amount"] = 44000.0, ["quantity"] = 115.0, ["revenue"] = 44000.0 }
        ],
        ["users"] = [
            new() { ["month"] = "Jan", ["channel"] = "Organic", ["signups"] = 1200.0, ["activeUsers"] = 8500.0, ["sessions"] = 45000.0 },
            new() { ["month"] = "Jan", ["channel"] = "Paid", ["signups"] = 800.0, ["activeUsers"] = 3200.0, ["sessions"] = 18000.0 },
            new() { ["month"] = "Feb", ["channel"] = "Organic", ["signups"] = 1350.0, ["activeUsers"] = 9200.0, ["sessions"] = 51000.0 },
            new() { ["month"] = "Feb", ["channel"] = "Paid", ["signups"] = 950.0, ["activeUsers"] = 3800.0, ["sessions"] = 21000.0 }
        ],
        ["products"] = [
            new() { ["product"] = "Laptop Pro", ["category"] = "Electronics", ["price"] = 1299.0, ["quantity"] = 450.0, ["revenue"] = 584550.0, ["profit"] = 184550.0 },
            new() { ["product"] = "Wireless Mouse", ["category"] = "Electronics", ["price"] = 49.0, ["quantity"] = 2200.0, ["revenue"] = 107800.0, ["profit"] = 63800.0 },
            new() { ["product"] = "USB-C Hub", ["category"] = "Electronics", ["price"] = 79.0, ["quantity"] = 1800.0, ["revenue"] = 142200.0, ["profit"] = 88200.0 },
            new() { ["product"] = "Headphones", ["category"] = "Electronics", ["price"] = 199.0, ["quantity"] = 1100.0, ["revenue"] = 218900.0, ["profit"] = 130900.0 }
        ],
        ["orders"] = [
            new() { ["month"] = "Jan", ["status"] = "completed", ["region"] = "North", ["count"] = 1250.0, ["amount"] = 125000.0 },
            new() { ["month"] = "Jan", ["status"] = "pending", ["region"] = "North", ["count"] = 85.0, ["amount"] = 8500.0 },
            new() { ["month"] = "Feb", ["status"] = "completed", ["region"] = "North", ["count"] = 1380.0, ["amount"] = 138000.0 },
            new() { ["month"] = "Mar", ["status"] = "completed", ["region"] = "North", ["count"] = 1520.0, ["amount"] = 152000.0 }
        ],
        ["inventory"] = [
            new() { ["product"] = "Laptop Pro", ["category"] = "Electronics", ["quantity"] = 125.0, ["status"] = "in_stock" },
            new() { ["product"] = "Wireless Mouse", ["category"] = "Electronics", ["quantity"] = 580.0, ["status"] = "in_stock" },
            new() { ["product"] = "USB-C Hub", ["category"] = "Electronics", ["quantity"] = 45.0, ["status"] = "low_stock" },
            new() { ["product"] = "Headphones", ["category"] = "Electronics", ["quantity"] = 0.0, ["status"] = "out_of_stock" }
        ]
    };

    private static readonly Dictionary<string, (List<string> Metrics, List<string> Dimensions)> Metadata = new()
    {
        ["sales"] = (["amount", "quantity", "revenue"], ["month", "region", "category"]),
        ["users"] = (["signups", "activeUsers", "sessions"], ["month", "channel"]),
        ["products"] = (["price", "quantity", "revenue", "profit"], ["product", "category"]),
        ["orders"] = (["count", "amount"], ["month", "status", "region"]),
        ["inventory"] = (["quantity"], ["product", "category", "status"])
    };

    public List<string> GetAvailableDatasets() => [.. MockData.Keys];

    public List<string> GetAvailableMetrics(string dataset) =>
        Metadata.TryGetValue(dataset, out var meta) ? meta.Metrics : [];

    public List<string> GetAvailableDimensions(string dataset) =>
        Metadata.TryGetValue(dataset, out var meta) ? meta.Dimensions : [];

    public ChartData ExecuteQuery(ChartIntent intent)
    {
        if (!MockData.TryGetValue(intent.Dataset, out var data))
            throw new ArgumentException($"Unknown dataset: {intent.Dataset}");

        var filtered = ApplyFilters(data, intent.Filters);
        return GroupAndAggregate(filtered, intent);
    }

    private static List<Dictionary<string, object>> ApplyFilters(
        List<Dictionary<string, object>> data, List<Filter>? filters)
    {
        if (filters == null || filters.Count == 0) return data;
        return data.Where(r => filters.All(f => CheckFilter(r, f))).ToList();
    }

    private static bool CheckFilter(Dictionary<string, object> record, Filter filter)
    {
        if (!record.TryGetValue(filter.Field, out var value)) return true;
        return filter.Operator switch
        {
            "eq" => value.Equals(filter.Value),
            "neq" => !value.Equals(filter.Value),
            _ => true
        };
    }

    private ChartData GroupAndAggregate(List<Dictionary<string, object>> data, ChartIntent intent)
    {
        var dimension = intent.Dimensions?.FirstOrDefault();
        var metrics = intent.Metrics;

        if (dimension == null)
        {
            var labels = metrics.Select(m => m.Label ?? $"{m.Aggregation}({m.Field})").ToList();
            var values = metrics.Select(m => Aggregate(data, m.Field, m.Aggregation)).ToList();
            return new ChartData(labels, [
                new ChartDataset("Value", values, Colors.Take(values.Count).ToList(), BorderColors.Take(values.Count).ToList())
            ]);
        }

        var groups = data.GroupBy(r => r.TryGetValue(dimension.Field, out var v) ? v?.ToString() ?? "Unknown" : "Unknown")
            .ToDictionary(g => g.Key, g => g.ToList());

        var groupLabels = groups.Keys.ToList();
        var isPie = intent.ChartType is "pie" or "doughnut";

        var datasets = metrics.Select((metric, idx) => new ChartDataset(
            metric.Label ?? $"{metric.Aggregation}({metric.Field})",
            groupLabels.Select(l => Aggregate(groups[l], metric.Field, metric.Aggregation)).ToList(),
            isPie ? Colors.Take(groupLabels.Count).ToList() : Colors[idx % Colors.Length],
            isPie ? BorderColors.Take(groupLabels.Count).ToList() : BorderColors[idx % BorderColors.Length]
        )).ToList();

        return new ChartData(groupLabels, datasets);
    }

    private static double Aggregate(List<Dictionary<string, object>> records, string field, string aggregation)
    {
        var values = records
            .Where(r => r.TryGetValue(field, out var v) && v is double)
            .Select(r => (double)r[field])
            .ToList();

        if (values.Count == 0) return 0;

        return aggregation switch
        {
            "sum" => values.Sum(),
            "avg" => values.Average(),
            "min" => values.Min(),
            "max" => values.Max(),
            "count" => values.Count,
            _ => values.Sum()
        };
    }
}
