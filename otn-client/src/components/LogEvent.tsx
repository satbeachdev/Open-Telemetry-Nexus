import React from 'react';
import EventTooltip from './EventTooltip';
import TimeFormatter from '../TimeFormatter';

export const SEVERITY_ICONS = {
  TRACE: 'radio_button_unchecked',  // Simple circle outline for lowest severity
  DEBUG: 'bug_report',              // Bug icon for debug messages
  INFO: 'info',                     // Standard info icon
  WARN: 'warning',                 // Warning triangle
  ERROR: 'error',                   // Error icon
  FATAL: 'dangerous'                // Octagon danger symbol
};

export const getSeverityFromLevel = (level: number): keyof typeof SEVERITY_ICONS => {
  // Based on OpenTelemetry severity level ranges
  if (level <= 4) return 'TRACE';     // Trace: 1-4
  if (level <= 8) return 'DEBUG';     // Debug: 5-8
  if (level <= 12) return 'INFO';     // Info: 9-12
  if (level <= 16) return 'WARN';     // Warn: 13-16
  if (level <= 20) return 'ERROR';    // Error: 17-20
  return 'FATAL';                     // Fatal: 21+
};

interface LogEventProps {
  id: number;
  index: number;
  message: string;
  left: string;
  top: number;
  barHeight: number;
  offset: number;
  severity: number;  // Changed to number to match OpenTelemetry
  isNearRightEdge?: boolean;
  onHover: (eventId: number | null) => void;
  onClick: (eventId: number) => void;
}

export const ICON_WIDTH = 16; // Width of the icon in pixels

const LogEvent: React.FC<LogEventProps> = ({ id, index, message, left, top, barHeight, offset, severity, isNearRightEdge, onHover, onClick }) => {
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
            fontVariationSettings: '"FILL" 1, "wght" 400'
          }}
        >
          {SEVERITY_ICONS[getSeverityFromLevel(severity)]}
        </span>
      </EventTooltip>
    </div>
  );
};

export default LogEvent;
