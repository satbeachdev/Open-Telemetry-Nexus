using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace api;
public class LogJsonRequestBodyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LogJsonRequestBodyMiddleware> _logger;

    public LogJsonRequestBodyMiddleware(RequestDelegate next, ILogger<LogJsonRequestBodyMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Ensure the request body can be read multiple times
        context.Request.EnableBuffering();

        // Read the request body
        var body = await ReadRequestBodyAsync(context.Request);

        if (!string.IsNullOrEmpty(body))
        {
            // Log the JSON request body
            _logger.LogInformation("Request Body: {RequestBody}", body);
            Console.WriteLine($"Request Body: {body}");
        }

        // Reset the request body stream position to allow the next middleware to read it
        context.Request.Body.Position = 0;

        // Call the next middleware
        await _next(context);
    }

    private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
    {
        using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
        return await reader.ReadToEndAsync();
    }
}