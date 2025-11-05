import React, { useState } from 'react';
import { Book } from '../data/books';

interface SidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  stamps: Array<{ id: number; name: string }>;
  onStampHover: (id: number | null) => void;
  hoveredStampId: number | null;
  onStampClick: (id: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  search,
  onSearchChange,
  stamps,
  onStampHover,
  hoveredStampId,
  onStampClick
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      <button
        id="toggle-sidebar"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-button"
        style={{
          width: '180px',
          height: '40px',
          textAlign: 'left',
          position: 'fixed',
          top: '26px',
          right: '20px',
          zIndex: 1001,
          padding: '8px 12px',
          background: '#444',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          borderRadius: '4px',
        }}
      >
        Show Books
      </button>
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
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '14px',
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
          style={{ width: '95%', marginBottom: '10px', padding: '5px' }}
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