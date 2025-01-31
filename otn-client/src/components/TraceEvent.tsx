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
  isNearRightEdge?: boolean;
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
  onClick,
  isNearRightEdge,
}) => {
  return (
    <div style={{ 
      position: 'absolute',
      left: '0',
      top,
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    }}>
      <div style={{
        position: 'absolute',
        right: `calc(100% - ${left})`,
        paddingRight: '4px',
        fontSize: '9px',
        color: backgroundColor,
        whiteSpace: 'nowrap'
      }}>
        {TimeFormatter.FormatTime(offset)}
      </div>
      <EventTooltip 
        title={`@${TimeFormatter.FormatTime(offset)} for ${TimeFormatter.FormatTime(duration)}: ${message}`}
        onMouseEnter={() => onHover(eventId)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(eventId)}
        placement={isNearRightEdge ? "left" : "right"}
        style={{
          cursor: 'pointer',
          width: '100%',
          position: 'absolute',
          left,
          height: `${barHeight}px`,
        }}
      >
        <div style={{
          position: 'relative',
          width,
          height: '100%',
          backgroundColor,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: '12px',
          borderRadius: '4px',
          zIndex: 1000,
        }}>
          {message}
        </div>
      </EventTooltip>
    </div>
  );
};

export default TraceEventBar;
