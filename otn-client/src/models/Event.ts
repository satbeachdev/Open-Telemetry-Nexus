import { ZonedDateTime } from 'js-joda';

export interface Event {
  id: number;
  message: string;
  startTime: ZonedDateTime; 
  endTime: ZonedDateTime;
  traceId: string;
  spanId: string;
  durationMilliseconds: number;
  severity: number;
} 