import axios, { AxiosRequestConfig } from 'axios';
import { ZonedDateTime } from 'js-joda';
import { trace, context, propagation, Span, SpanStatusCode } from '@opentelemetry/api';
import { Event } from '../models/Event';
import { Attribute } from '../models/Attribute';
import { TraceEvent } from '../models/TraceEvent';

class EventService {
  private static eventAttributes: Map<string, any[]> = new Map();

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
    const response = await axios.get(`http://localhost:8000/traces/${traceId}/events`);
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

    const tracer = trace.getTracer("manta");
    
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

  static async LoadPredefinedFilters(): Promise<string[]> {
    try {
        const response = await axios.get('http://localhost:8000/filters'); 
        return response.data;
    } catch (error) {
        console.error('Failed to load predefined filters:', error);
        return [];
    }
  }

  static async LoadEventAttribute(eventId: string): Promise<any[]> {
    // Check if we already have attributes for this event
    if (this.eventAttributes.has(eventId)) {
        return this.eventAttributes.get(eventId)!;
    }

    try {
        const response = await fetch(`/api/events/${eventId}/attributes`);
        const attributes = await response.json();
        // Store attributes for this specific event
        this.eventAttributes.set(eventId, attributes);
        return attributes;
    } catch (error) {
        console.error('Error loading event attributes:', error);
        return [];
    }
  }

  // Change to static method and use EventService.eventAttributes
  static clearEventAttributes(eventId?: string) {
    if (eventId) {
        EventService.eventAttributes.delete(eventId);
    } else {
        EventService.eventAttributes.clear();
    }
  }
}

export default EventService;