import React, { useEffect, useRef, useState } from 'react';
import { GridCell } from './types';

export interface Stamp {
  id: number;
  name: string;
}

interface IsometricGridProps {
  gridCellsData: GridCell[][];
  rowStartingColOffsets: number[];
  hoveredStampId: number | null;
  onStampHover: (id: number | null) => void;
  /**
   * Optional richer hover callback so parents can derive geometry.
   * Sends the hovered stamp id and the hovered cell element.
   */
  onCellHover?: (info: { id: number; el: HTMLElement } | null) => void;
  onHeightCalculated?: (height: number) => void;
  onStampClick: (id: number) => void;
}

const cellSize = 100;
const cellSpacing = 15;
const effectiveCellWidth = cellSize + cellSpacing;

const getStampUrl = (id: number) => {
  try {
    // Try to load the ID-specific thumbnail
    return new URL(`../assets/thumbnails/${id}.jpg`, import.meta.url).href;
  } catch {
    // Fallback if the above fails (e.g., missing file)
    return new URL(`../assets/thumbnails/fallback.jpg`, import.meta.url).href;
  }
};

export const IsometricGrid: React.FC<IsometricGridProps> = ({
  gridCellsData,
  rowStartingColOffsets,
  hoveredStampId,
  onStampHover,
  onCellHover,
  onHeightCalculated,
  onStampClick
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleHeight, setVisibleHeight] = useState(0);

  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;

    const cells = gridEl.querySelectorAll(".grid-cell");
    if (!cells.length) return;

    const lastCell = cells[cells.length - 1] as HTMLElement;
    const gridTop = gridEl.getBoundingClientRect().top;
    const cellBottom = lastCell.getBoundingClientRect().bottom;
    const projectedHeight = cellBottom - gridTop;
    const paddedHeight = projectedHeight + 100;

    setVisibleHeight(paddedHeight);
    if (onHeightCalculated) onHeightCalculated(paddedHeight);
  }, [gridCellsData, onHeightCalculated]);

  useEffect(() => {
    if (gridRef.current) {
      const gridElement = gridRef.current;
      const cells = Array.from(gridElement.children) as HTMLElement[];

      cells.forEach(cell => {
        cell.style.opacity = '0';
        cell.style.transform = 'scale(0.8)';
        cell.style.visibility = 'hidden';
      });

      let cellIndex = 0;
      gridCellsData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const delay = 100 * (rowIndex * row.length + colIndex);
          setTimeout(() => {
            if (cells[cellIndex]) {
              cells[cellIndex].style.visibility = 'visible';
              cells[cellIndex].style.opacity = cell.stamp ? '1' : '1'; 
              cells[cellIndex].style.transform = 'scale(1)';
            }
            cellIndex++;
          }, delay);
        });
      });
    }
  }, [gridCellsData]);

  useEffect(() => {
    if (gridRef.current && onHeightCalculated) {
      onHeightCalculated(visibleHeight);
    }
  }, [visibleHeight, onHeightCalculated]);

  return (
    <div 
      ref={gridRef}
      className="isometric-grid"
      style={{ height: `${visibleHeight}px` }}
    >
      {gridCellsData.map((row, rowIndex) => {
        const baseColOffset = rowStartingColOffsets[rowIndex];
        return row.map((cell, colIndex) => {
          const classNames = ['grid-cell'];
          if (!cell.stamp) classNames.push('empty');
          if (cell.stamp?.id === hoveredStampId) classNames.push('highlighted');
          if (gridRef.current) classNames.push('animate-in');

          return (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className={classNames.join(' ')}
              style={{
                top: `${rowIndex * effectiveCellWidth}px`,
                left: `${(colIndex + baseColOffset) * effectiveCellWidth}px`,
                opacity: cell.stamp ? 0 : 0,
                transform: 'scale(0.8)'
              }}
              onMouseEnter={(e) => {
                if (cell.stamp) {
                  onStampHover(cell.stamp.id);
                  if (onCellHover) onCellHover({ id: cell.stamp.id, el: e.currentTarget as HTMLElement });
                }
              }}
              onMouseLeave={() => {
                onStampHover(null);
                if (onCellHover) onCellHover(null);
              }}
              onClick={() => cell.stamp && onStampClick(cell.stamp.id)}
            >
              {cell.stamp ? (
                <img
                  src={getStampUrl(cell.stamp.id)}
                  alt={cell.stamp.name}
                  className="stamp"
                />
              ) : (
                // Optional: Render a placeholder div for empty cells
                <div className="empty-cell"></div>
              )}
            </div>
          );
        });
      })}
    </div>
  );
};