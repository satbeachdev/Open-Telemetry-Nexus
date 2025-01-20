import React, { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (showTooltip && tooltipRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // If tooltip would overflow right side, force left placement
      if (containerRect.right + tooltipRect.width > viewportWidth) {
        tooltipRef.current.style.right = '100%';
        tooltipRef.current.style.left = 'auto';
      } else {
        tooltipRef.current.style.left = '100%';
        tooltipRef.current.style.right = 'auto';
      }
    }
  }, [showTooltip]);

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
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            marginLeft: '10px',
            marginRight: '10px'
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