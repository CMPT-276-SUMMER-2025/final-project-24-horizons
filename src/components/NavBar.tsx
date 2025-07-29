import './NavBar.css';
import { Link } from 'react-router-dom';

const navLinks = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Calendar', to: '/calendar' },
  { name: 'Study', to: '/study'},
  { name: 'Settings', to: '/settings' },
];

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">StudySync</div>
        <div className="navbar-links">
          {navLinks.map(link => (
            <Link key={link.name} to={link.to}>{link.name}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;