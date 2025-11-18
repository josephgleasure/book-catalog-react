import React, { forwardRef } from 'react';

interface HoverNameDisplayProps {
  title: string;
  side?: 'right' | 'left';
  topVh?: number;
  visible: boolean;
  /** Optional horizontal positioning by viewport percentage from the left */
  leftPercent?: number;
}

/**
 * Fixed-position label that shows the hovered book title.
 * Exposes a ref to anchor the connector line to its edge.
 */
const HoverNameDisplay = forwardRef<HTMLDivElement, HoverNameDisplayProps>(
  ({ title, side = 'right', topVh = 25, visible, leftPercent }, ref) => {
    const style: React.CSSProperties = {
      position: 'fixed',
      top: `${topVh}vh`,
      ...(leftPercent !== undefined
        ? { left: `${leftPercent}vw` }
        : { [side]: '24px' as const }),
      transform: 'translateY(-50%)',
      background: '#fff',
      border: '1px solid #111',
      padding: '10px 14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      zIndex: 1500,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 150ms ease',
      maxWidth: '40vw',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: 14,
      lineHeight: 1.3,
    } as React.CSSProperties;

    return (
      <div ref={ref} aria-live="polite" style={style}>
        {title}
      </div>
    );
  }
);

HoverNameDisplay.displayName = 'HoverNameDisplay';
export default HoverNameDisplay;


