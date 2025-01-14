namespace Manta.Api.Interfaces;

public interface IOpenTelemetryHandler<T>
{
    void Handle(T message);
}