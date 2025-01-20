import React from 'react';
import EventTooltip from './EventTooltip';
import TimeFormatter from '../TimeFormatter';

interface LogEventProps {
  id: number;
  index: number;
  message: string;
  left: string;
  top: number;
  barHeight: number;
  offset: number;
  isNearRightEdge?: boolean;
  onHover: (eventId: number | null) => void;
  onClick: (eventId: number) => void;
}

export const ICON_WIDTH = 16; // Width of the icon in pixels

const LogEvent: React.FC<LogEventProps> = ({ id, index, message, left, top, barHeight, offset, isNearRightEdge, onHover, onClick }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: `${ICON_WIDTH}px`
      }}
    >
      <EventTooltip
        title={`@${TimeFormatter.FormatTime(offset)}: ${message}`}
        placement={isNearRightEdge ? "left" : "right"}
        style={{ 
          cursor: 'pointer',
          width: '100%'
        }}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(id)}
      >
        {index > 0 && (
          <span
            style={{ 
              position: 'absolute',
              fontSize: '9px',
              whiteSpace: 'nowrap',
              left: '50%',
              transform: 'translate(-50%, -40%)',
              marginBottom: '3px'
            }}
          >
            {TimeFormatter.FormatTime(offset)}
          </span>
        )}
        <span 
          className="material-symbols-outlined"
          style={{
            fontSize: `${ICON_WIDTH}px`,
            position: 'relative',
            top: '1px',
            marginTop: '3px',
            fontVariationSettings: '"FILL" 0, "wght" 100'
          }}
        >
          info
        </span>
      </EventTooltip>
    </div>
  );
};

export default LogEvent;
