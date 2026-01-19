using System.Text.Json;
using System.Text.Json.Serialization;
using PromptChart.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register services
builder.Services.AddSingleton<IDataAdapter, MockDataAdapter>();
builder.Services.AddSingleton<ILLMProvider>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY")
        ?? config["OpenAI:ApiKey"]
        ?? throw new InvalidOperationException("OpenAI API key not configured");
    var model = Environment.GetEnvironmentVariable("OPENAI_MODEL")
        ?? config["OpenAI:Model"]
        ?? "gpt-4o-mini";
    return new OpenAIProvider(apiKey, model);
});
builder.Services.AddSingleton<IIntentResolver, IntentResolver>();

var app = builder.Build();

app.UseCors();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
app.Run($"http://localhost:{port}");
