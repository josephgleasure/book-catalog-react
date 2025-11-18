import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface ConnectorProps {
  tileEl: HTMLElement | null;
  labelEl: HTMLElement | null;
  side?: 'right' | 'left';
  elbowGap?: number;
  color?: string;
  width?: number;
  snapToIso45?: boolean;
  visible: boolean;
  /** Multiply the snapped 45° direction by +1 or -1 to reverse angle */
  angleSign?: 1 | -1;
}

/**
 * Full-viewport SVG overlay that draws a two-segment elbow polyline
 * from the hovered tile center to the label box edge.
 */
const HoverConnector: React.FC<ConnectorProps> = ({
  tileEl,
  labelEl,
  side = 'right',
  elbowGap = 32,
  color = '#111',
  width = 2,
  snapToIso45 = true,
  visible,
  angleSign = 1,
}) => {
  const [points, setPoints] = useState<[number, number, number, number, number, number] | null>(null);
  const rafRef = useRef<number | null>(null);

  const sideSign = useMemo(() => (side === 'right' ? -1 : 1), [side]);

  useEffect(() => {
    const compute = () => {
      if (!tileEl || !labelEl) {
        setPoints(null);
        return;
      }
      const tr = tileEl.getBoundingClientRect();
      const lr = labelEl.getBoundingClientRect();

      const sx = tr.left + tr.width / 2;
      const sy = tr.top + tr.height / 2;
      const ex = side === 'right' ? lr.left : lr.right;
      const ey = lr.top + lr.height / 2;

      let kx: number;
      let ky = ey;
      if (snapToIso45) {
        const deltaY = ey - sy;
        const kxCandidate = sx + angleSign * sideSign * Math.abs(deltaY);
        if (side === 'right') {
          kx = Math.min(kxCandidate, ex - elbowGap);
        } else {
          kx = Math.max(kxCandidate, ex + elbowGap);
        }
      } else {
        kx = ex - sideSign * elbowGap;
      }
      setPoints([sx, sy, kx, ky, ex, ey]);
    };

    let active = true;
    const loop = () => {
      if (!active) return;
      compute();
      rafRef.current = requestAnimationFrame(loop);
    };

    if (visible && tileEl && labelEl) {
      loop();
    } else {
      setPoints(null);
    }

    const onScroll = () => {
      if (!visible) return;
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [tileEl, labelEl, side, elbowGap, snapToIso45, visible, sideSign, angleSign]);

  const svgStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 1400,
    opacity: visible && points ? 1 : 0,
    transition: 'opacity 120ms ease',
  };

  return (
    <svg viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} style={svgStyle}>
      {points && (
        <>
          <polyline
            points={`${points[0]},${points[1]} ${points[2]},${points[3]} ${points[4]},${points[5]}`}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={points[0]} cy={points[1]} r={3} fill={color} />
        </>
      )}
    </svg>
  );
};

export default HoverConnector;


