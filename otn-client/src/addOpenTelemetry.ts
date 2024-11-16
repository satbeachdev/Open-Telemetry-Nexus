import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

export const AddOpenTelemetry = (serviceName: string): void => {
  const resource = new Resource({ "service.name": serviceName });
  const provider = new WebTracerProvider({ resource });
  const collector = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
    headers: {},  
  });

  provider.addSpanProcessor(new BatchSpanProcessor(collector));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new XMLHttpRequestInstrumentation(),
    ],
  });

  console.log(`OpenTelemetry initialized for ${serviceName}`);  
};