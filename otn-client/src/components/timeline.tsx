import React, { useMemo } from 'react';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import { Duration } from 'js-joda'; // Import js-joda
import TimelineContainer from './TimelineContainer'; // Import the new component
import LogEvent from './LogEvent';
import { TraceEvent } from '../eventService';
import TraceEventBar from './TraceEvent';

// interface BarData {
//   id: string;
//   label: string;
//   startTime: ZonedDateTime; // Changed from Date to ZonedDateTime
//   endTime: ZonedDateTime; // Changed from Date to ZonedDateTime
//   spanId: string;
// }

interface TimelineProps {
  events: TraceEvent[]; // Changed from bars to events
  onEventHover: (eventId: Number | null) => void;  // Changed Number to number for consistency
  onEventClick: (eventId: number) => void;
}

export enum EventType {
  Undefined = 'Undefined',
  Log = 'Log',
  Trace = 'Trace'
}

const Timeline: React.FC<TimelineProps> = ({ events, onEventHover, onEventClick }) => { // Changed from bars to events
  
  const theme = useTheme(); // Get the current theme

  // Function to determine if a color is light
  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.slice(0, 2), 16);
    const c_g = parseInt(hex.slice(2, 2), 16);
    const c_b = parseInt(hex.slice(4, 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 155;
  };

  const barHeight = 20; // Define barHeight at the beginning of the Timeline component
  const barSpacing = 10; // Define spacing between bars

  // Memoized color map to ensure consistent colors for spanIds
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    let colorIndex = 0;

    // Define a color palette based on the themeß
    const colorPalette = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      // Add more colors as needed
    ];
  
    events.forEach(bar => {
      if (!map.has(bar.spanId)) {
        map.set(bar.spanId, colorPalette[colorIndex % colorPalette.length]);
        colorIndex++;
      }
    });

    return map;
  }, [events, theme]);
  
  const containerHeight = useMemo(() => {
    let height = 0;
    let consecutivePoints = 0;

    events.forEach((event, index) => {
      const isPointEvent = event.durationMilliseconds === 0;

      if (isPointEvent) {
        if (consecutivePoints === 0) {
          height += barHeight + barSpacing;
        }
        consecutivePoints++;
      } else {
        height += barHeight + barSpacing;
        consecutivePoints = 0;
      }
    });

    // Add height for the last event if it's not a point event
    if (consecutivePoints === 0 && events.length > 0) {
      height += barHeight;
    }

    return height;
  }, [events, barHeight, barSpacing]);
  
  if (events.length === 0) return null; // Return null if events are empty

  const startTime = events.reduce((min, bar) => bar.startTime.isBefore(min) ? bar.startTime : min, events[0].startTime);
  const endTime = events.reduce((max, bar) => bar.endTime.isAfter(max) ? bar.endTime : max, events[0].endTime);

  const totalDuration = Duration.between(startTime, endTime).toNanos() / 1000_000; // Calculate total duration

  const calculateBarPosition = (bar: TraceEvent) => {
    const totalDurationNanos = Duration.between(startTime, endTime).toNanos();
    const barOffsetNanos = Duration.between(startTime, bar.startTime).toNanos();

    const left = barOffsetNanos / totalDurationNanos * 100;
    const width = Math.min(100, Duration.between(bar.startTime, bar.endTime).toNanos() / totalDurationNanos * 100); // Ensure minimum width of 20

    return { left: `${left}%`, width: `${width}%` }; // Return width in pixels
  };

  const divisionLines = [0, 0.25, 0.5, 0.75, 1];

  const renderEvents = () => {
    let currentTop = 0;
    let lastEventType: EventType = EventType.Undefined;

    return events.map((event, index) => {

      const { left, width } = calculateBarPosition(event);
      const isLogEvent = event.durationMilliseconds === 0;

      if (isLogEvent) {
        if (lastEventType === EventType.Trace) {
          currentTop += barHeight + barSpacing;
        }
        lastEventType = EventType.Log;
      } else {
        if (index > 0) {
          currentTop += barHeight + barSpacing;
        }
        lastEventType = EventType.Trace;
      }

      if (isLogEvent) {
        return (
          <LogEvent
            key={event.id}
            id={event.id}
            index={index}
            message={event.message}
            left={left}
            top={currentTop}
            barHeight={barHeight}
            offset={event.offsetMilliseconds}
            onHover={(id) => {
              console.log('Log event hover:', id, 'Original event.id:', Number(event.id));
              onEventHover(Number(id));
            }}
            onClick={() => onEventClick(event.id)}
          />
        );
      }

      const backgroundColor = colorMap.get(event.spanId) || theme.palette.primary.main;
      const textColor = isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';

      return (
        <TraceEventBar
          key={event.id}
          eventId={event.id}
          message={event.message}
          left={left}
          width={width}
          top={currentTop}
          barHeight={barHeight}
          backgroundColor={backgroundColor}
          textColor={textColor}
          offset={event.offsetMilliseconds}
          duration={event.durationMilliseconds}
          onHover={(id) => {
            console.log('Trace event hover:', id, 'Original event.id:', Number(event.id));
            onEventHover(Number(id));
          }}
          onClick={(id) => {
            console.log('Trace event clicked:', id);
            onEventClick(id);
          }}
        />
      );
    });
  };

  return (
    <TimelineContainer 
      divisionLines={divisionLines} 
      totalDuration={totalDuration} 
      height={containerHeight} // Pass the calculated height
    >
      {renderEvents()} 
    </TimelineContainer>
  );
};

export default Timeline;
