import React from 'react';
import { useTheme } from '@mui/material/styles';
import TimeFormatter from '../TimeFormatter';

interface TimelineContainerProps {
  divisionLines: number[];
  totalDuration: number;
  children: React.ReactNode; // To allow rendering of bars and other elements
  height: number;
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({ divisionLines, totalDuration, children, height }) => {
  const theme = useTheme();

  return (
    <div className="timeline-container" style={{ position: 'relative', width: '100%', height: `${height}px`, border: '1px solid #ddd' }}>
      {/* Division Lines */}
      {divisionLines.map((position, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${position * 100}%`,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: '#ccc',
          }}
        />
      ))}

      {/* Time Labels */}
      {divisionLines.map((position, index) => {
        const labelTime = totalDuration * position;
        let labelStyle: React.CSSProperties = {
          position: 'absolute',
          top: '100%',
          fontSize: theme.typography.body2.fontSize,
          color: theme.palette.text.secondary,
        };

        if (index === 0) {
          labelStyle = { ...labelStyle, left: 0, transform: 'translateY(4px)' };
        } else if (index === divisionLines.length - 1) {
          labelStyle = { ...labelStyle, right: 0, transform: 'translateY(4px)' };
        } else {
          labelStyle = { ...labelStyle, left: `${position * 100}%`, transform: 'translate(-50%, 4px)' };
        }

        return (
          <div key={index} style={labelStyle}>
            {TimeFormatter.FormatTime(labelTime)}
          </div>
        );
      })}

      {/* Render Children (Bars and other elements) */}
      {children}
    </div>
  );
};

export default TimelineContainer;
