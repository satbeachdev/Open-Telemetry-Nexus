import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import TimeFormatter from '../TimeFormatter';

interface LogEventProps {
  id: string;
  message: string;
  left: string;
  top: number;
  barHeight: number;
  offset: number;
}

const LogEvent: React.FC<LogEventProps> = ({ id, message, left, top, barHeight, offset }) => {
  const index = parseInt(id, 10);

  return (
    <Tooltip 
      title={`@${TimeFormatter.FormatTime(offset)}: ${message}`}
      key={id}
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -barHeight],
            },
          },
        ],
      }}
      slotProps={{
        tooltip: {
          sx: {
            fontSize: '12px',
          },
        },
      }}
    >
      <div style={{ 
          position: 'absolute', 
          left, 
          top,
          cursor: 'default' // This keeps the cursor as a pointer
        }}>
        {index > 1  && (
        <span
          style={{ 
            position: 'absolute', 
            fontSize: '9px',
            whiteSpace: 'nowrap',
            transform: 'translate(-100%, 50%)', // Center vertically
          }}
        >
          {TimeFormatter.FormatTime(offset)}
        </span>)}
        <span className="material-symbols-outlined">
          event_note
        </span>
      </div>
    </Tooltip>
  );
};

export default LogEvent;
