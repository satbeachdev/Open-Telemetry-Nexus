import axios, { AxiosRequestConfig } from 'axios';
import { ZonedDateTime } from 'js-joda';
import { trace, context, propagation, Span, SpanStatusCode } from '@opentelemetry/api';

export interface Event {
  id: number;
  message: string;
  startTime: ZonedDateTime; 
  endTime: ZonedDateTime;
  traceId: string;
  spanId: string;
  durationMilliseconds: number;
}

export interface TraceEvent {
  id: number;
  message: string;
  startTime: ZonedDateTime; 
  endTime: ZonedDateTime;
  spanId: string;
  offsetMilliseconds: number;
  durationMilliseconds: number;
}

export interface Attribute {
  name: string;
  value: string; 
}

class EventService {
  static async LoadEvents(skip: number, limit: number): Promise<{ data: Event[], count: number }> {
    const response = await axios.get(`http://localhost:8000/allevents?skip=${skip}&limit=${limit}`);
    const totalCount = response.headers['x-total-count'] || '0';
    console.log('x-total-count = ' + totalCount);
    return { data: response.data, count: parseInt(totalCount) };
  }

  static async LoadEventAttributes(eventId: number): Promise<Attribute[]> {
    const response = await axios.get(`http://localhost:8000/events/${eventId}/attributes`);
    return response.data;
  }

  static async LoadTraceEvents(traceId: string): Promise<TraceEvent[]> {
    const response = await axios.get(`http://localhost:8000/events/${traceId}/events`);
    return response.data.map((event: any) => ({
      ...event,
      startTime: ZonedDateTime.parse(event.startTime),
      endTime: ZonedDateTime.parse(event.endTime)
    }));
  }

  static async LoadUniqueAttributeNames(): Promise<string[]> {
    const response = await axios.get(`http://localhost:8000/events/attribute-names`);
    return response.data;
  }

  static async LoadUniqueAttributeNames2(): Promise<string[]> {

    const tracer = trace.getTracer("ot-nexus");
    
    return tracer.startActiveSpan('make API call', async (span: Span) => {
      try {
        const traceHeaders = {};
        // inject context to trace headers for propagtion to the next service
        propagation.inject(context.active(), traceHeaders);

        const config: AxiosRequestConfig = {
          headers: traceHeaders
        };

        const response = await axios.get(`http://localhost:8000/events/attribute-names`, config);

        return response.data;
      } catch (error) {
        span.setStatus({code: SpanStatusCode.ERROR, message: "xxx",});
      } finally {
        span.end();
      }
    });



  }

  static async FilterEvents(filter: string, skip: number, limit: number): Promise<{ data: Event[], count: number }> {
    const response = await axios.get(`http://localhost:8000/events?filter=${filter}&skip=${skip}&limit=${limit}`);
    const totalCount = parseInt(response.headers['x-total-count'] || '0');
    console.log('x-total-count = ' + totalCount);
    return { data: response.data, count: totalCount };
  }
}

export default EventService;