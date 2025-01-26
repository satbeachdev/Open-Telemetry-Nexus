import { ZonedDateTime } from "js-joda";

export interface Filter {
  id: number;
  text: string;
  lastUsed?: ZonedDateTime;
} 