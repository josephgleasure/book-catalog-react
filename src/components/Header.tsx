import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="site-header">
      <div className="site-title">archive.process</div>
      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/downloads">Downloads</Link>
      </nav>
    </header>
  );
};

export default Header; 