import React from 'react';
import EventTooltip from './EventTooltip';
import TimeFormatter from '../TimeFormatter';

interface TraceEventBarProps {
  eventId: number;
  message: string;
  left: string;
  width: string;
  top: number;
  barHeight: number;
  backgroundColor: string;
  textColor: string;
  offset: number;
  duration: number;
  onHover: (eventId: number | null) => void;
  onClick: (eventId: number) => void;
}

const TraceEventBar: React.FC<TraceEventBarProps> = ({
  eventId,
  message,
  left,
  width,
  top,
  barHeight,
  backgroundColor,
  textColor,
  offset,
  duration,
  onHover,
  onClick
}) => {
  return (
    <EventTooltip 
      title={`@${TimeFormatter.FormatTime(offset)} for ${TimeFormatter.FormatTime(duration)}: ${message}`}
      onMouseEnter={() => onHover(eventId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(eventId)}
      style={{
        position: 'absolute',
        left,
        width,
        top,
        height: barHeight,
        backgroundColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        fontSize: '12px',
        borderRadius: '4px',
      }}
    >
      {message}
    </EventTooltip>
  );
};

export default TraceEventBar;
