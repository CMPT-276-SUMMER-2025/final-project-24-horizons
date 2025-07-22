import './NavBar.css';
import { Link } from 'react-router-dom';

const navLinks = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Calendar', to: '/calendar' },
  { name: 'Settings', to: '#' },
];

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">StudySync</div>
        <div className="navbar-links">
          {navLinks.map(link =>
            link.to === '#' ? (
              <span key={link.name} style={{ color: '#888', padding: '0.25em 0.7em' }}>{link.name}</span>
            ) : (
              <Link key={link.name} to={link.to}>{link.name}</Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;