import { ZonedDateTime } from 'js-joda';

export interface TraceEvent {
  id: number;
  message: string;
  startTime: ZonedDateTime; 
  endTime: ZonedDateTime;
  spanId: string;
  offsetMilliseconds: number;
  durationMilliseconds: number;
  severity: number;
} 