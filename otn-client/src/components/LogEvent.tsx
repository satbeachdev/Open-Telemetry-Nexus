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
  onHover: (eventId: number | null) => void;
  onClick: (eventId: number) => void;
}

const LogEvent: React.FC<LogEventProps> = ({ id, index, message, left, top, barHeight, offset, onHover, onClick }) => {
  return (
    <EventTooltip
      title={`@${TimeFormatter.FormatTime(offset)}: ${message}`}
      style={{ 
        position: 'absolute', 
        left, 
        top,
        cursor: 'pointer'
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
          fontSize: '16px',
          position: 'relative',
          top: '1px',
          marginTop: '3px'
        }}
      >
        chat
      </span>
    </EventTooltip>
  );
};

export default LogEvent;
