namespace api;

public interface IWebRequestHandler
{
    Task<IResult> Handle(HttpContext ctx);
}

public interface IWebRequestHandler<T1>
{
    Task<IResult> Handle(HttpContext ctx, T1 param1);
}

public interface IWebRequestHandler<T1, T2>
{
    Task<IResult> Handle(HttpContext ctx, T1 param1, T2 param2);
}

public interface IWebRequestHandler<T1, T2, T3>
{
    Task<IResult> Handle(HttpContext ctx, T1 param1, T2 param2, T3 param3);
}