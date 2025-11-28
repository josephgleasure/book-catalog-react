import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const isLibrary = location.pathname === '/library';
  return (
    <header className="site-header">
      <div className="site-title">archive.process</div>
      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/library">Library</Link>
        <Link to="/about">About</Link>
        <Link to="/downloads">Downloads</Link>
      </nav>
      <div className="site-actions">
        {!isLibrary && (
          <button
            id="toggle-sidebar"
            aria-expanded={isSidebarOpen}
            onClick={onToggleSidebar}
          >
            Browse Library
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 