namespace api;

public interface IOpenTelemetryHandler<T>
{
    void Handle(T message);
}