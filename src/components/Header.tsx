import { Link } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  return (
    <header className="site-header">
      <div className="site-title">archive.process</div>
      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/downloads">Downloads</Link>
      </nav>
      <div className="site-actions">
        <button
          id="toggle-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          Browse Library
        </button>
      </div>
    </header>
  );
};

export default Header; 