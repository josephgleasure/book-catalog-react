import React from 'react';
import { Book } from '../data/books';

interface SidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  stamps: Array<{ id: number; name: string }>;
  onStampHover: (id: number | null) => void;
  hoveredStampId: number | null;
  onStampClick: (id: number) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  search,
  onSearchChange,
  stamps,
  onStampHover,
  hoveredStampId,
  onStampClick,
  isCollapsed
}) => {

  return (
    <>
      <div
        className="sidebar"
        style={{
          width: '180px',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          position: 'fixed',
          top: '66px',
          right: '20px',
          background: '#ffffffcc',
          border: '1px solid #ccc',
          padding: '10px',
          fontFamily: 'inherit',
          fontSize: '12px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          zIndex: 999,
          display: isCollapsed ? 'none' : 'block',
        }}
      >
        <input
          id="search-bar"
          placeholder="Search library..."
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: '95%', marginBottom: '10px', padding: '5px', fontFamily: 'inherit' }}
        />
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {stamps.map((stamp) => (
            <li
              key={stamp.id}
              className={hoveredStampId === stamp.id ? 'hovered' : ''}
              onMouseEnter={() => onStampHover(stamp.id)}
              onMouseLeave={() => onStampHover(null)}
              onClick={() => onStampClick(stamp.id)}
              style={{
                padding: '6px 8px',
                transition: 'background-color 0.3s',
                cursor: 'pointer',
                backgroundColor: hoveredStampId === stamp.id ? '#ff0000' : 'transparent',
                color: hoveredStampId === stamp.id ? 'white' : 'inherit',
                fontWeight: hoveredStampId === stamp.id ? 'bold' : 'normal',
                borderLeft: hoveredStampId === stamp.id ? '5px solid #000' : 'none',
              }}
            >
              {stamp.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar; 