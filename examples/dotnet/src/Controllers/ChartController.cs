using Microsoft.AspNetCore.Mvc;
using PromptChart.Models;
using PromptChart.Services;

namespace PromptChart.Controllers;

[ApiController]
[Route("api")]
public class ChartController : ControllerBase
{
    private readonly IIntentResolver _resolver;

    public ChartController(IIntentResolver resolver)
    {
        _resolver = resolver;
    }

    [HttpPost("chart")]
    public async Task<IActionResult> GenerateChart([FromBody] ChartRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
            return BadRequest(new { error = "Missing or invalid prompt" });

        try
        {
            var result = await _resolver.ResolveAsync(request.Prompt);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "ok", timestamp = DateTime.UtcNow.ToString("o") });
    }
}
