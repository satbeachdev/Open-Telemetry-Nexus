import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

interface EventTooltipProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const EventTooltip: React.FC<EventTooltipProps> = ({ 
  title, 
  children, 
  style,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tooltipElement, setTooltipElement] = useState<HTMLDivElement | null>(null);

  const adjustPosition = useCallback((x: number, y: number) => {
    if (!tooltipElement) return { x, y };

    const tooltipWidth = tooltipElement.offsetWidth;
    const tooltipHeight = tooltipElement.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let adjustedX = x + 10;
    let adjustedY = y - 30;

    // Adjust horizontal position
    if (adjustedX + tooltipWidth > windowWidth) {
      adjustedX = x - tooltipWidth - 10;
    }

    // Adjust vertical position
    if (adjustedY < 0) {
      adjustedY = y + 10;
    }

    return { x: adjustedX, y: adjustedY };
  }, [tooltipElement]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = adjustPosition(e.clientX, e.clientY);
    setPosition({ x, y });
  };

  return (
    <div
      style={style}
      onMouseEnter={() => {
        setShowTooltip(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        onMouseLeave?.();
      }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {showTooltip && (
        <Box
          ref={setTooltipElement}
          sx={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          {title}
        </Box>
      )}
      {children}
    </div>
  );
};

export default EventTooltip; 