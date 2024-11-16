import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import TimeFormatter from '../TimeFormatter';

interface TraceEventProps {
  id: string;
  message: string;
  left: string;
  width: string;
  top: number;
  barHeight: number;
  backgroundColor: string;
  textColor: string;
  offset: number;
  duration: number;
}

const TraceEventBar: React.FC<TraceEventProps> = ({
  id,
  message,
  left,
  width,
  top,
  barHeight,
  backgroundColor,
  textColor,
  offset,
  duration
}) => {
  const index = parseInt(id, 10);

  return (
      <div style={{ position: 'relative' }}>
      {index > 1  && (
          <span
            style={{ 
              position: 'absolute', 
              top,
              left,
              fontSize: '9px',
              whiteSpace: 'nowrap',
              transform: 'translate(-100%, 50%)',
              paddingRight: '4px',
            }}
          >
            {TimeFormatter.FormatTime(offset)}
          </span>
        )}
    <Tooltip
      key={id}
      title={`@${TimeFormatter.FormatTime(offset)} (${TimeFormatter.FormatTime(duration)}): ${message}`}
      arrow={true}
      placement="bottom"
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -barHeight/2],
            },
          },
        ],
      }}
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: '12px',
          },
        },
      }}
    >
    <div
        style={{
        position: 'absolute',
        left,
        width,
        height: barHeight,
        top,
        backgroundColor,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '12px',
        lineHeight: `${barHeight}px`,
        padding: '0 4px',
        boxSizing: 'border-box',
        color: textColor,
        }}
    >
        {message}
    </div>
    </Tooltip>
    </div>);
};

export default TraceEventBar;
