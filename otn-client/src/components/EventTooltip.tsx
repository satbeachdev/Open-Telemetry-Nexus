import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';

interface EventTooltipProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  placement?: 'left' | 'right';
  containerRef?: React.RefObject<HTMLElement>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const EventTooltip: React.FC<EventTooltipProps> = ({ 
  title, 
  children, 
  style,
  placement = 'right',
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showTooltip || !containerRef.current || !tooltipRef.current) return;
    
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const windowWidth = window.innerWidth;
    const mouseX = e.clientX;
    
    // Determine if we should show the tooltip on the left or right based on available space
    const spaceOnRight = windowWidth - mouseX;
    const shouldShowOnLeft = spaceOnRight < (tooltipWidth + 20);
    
    const x = shouldShowOnLeft ? mouseX - tooltipWidth - 10 : mouseX + 10;
    const y = e.clientY;
    
    tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        position: 'relative'
      }}
      onMouseEnter={() => {
        setShowTooltip(true);
        onMouseEnter?.();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setShowTooltip(false);
        onMouseLeave?.();
      }}
      onClick={onClick}
    >
      {showTooltip && (
        <Box
          ref={tooltipRef}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            transform: 'translate(0, 0)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            transformOrigin: '0 50%'
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