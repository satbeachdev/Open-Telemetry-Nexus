using System.IO.Compression;

namespace Manta.Api.Middleware;

public class GzipDecompressionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers["Content-Encoding"] == "gzip")
        {
            context.Request.Body = new GZipStream(context.Request.Body, CompressionMode.Decompress);
        }
        await next(context);
    }
}
