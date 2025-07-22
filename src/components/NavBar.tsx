import './NavBar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const navLinks = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Calendar', to: '/calendar' },
  { name: 'Settings', to: '#' },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
          {user && (
            <button onClick={handleLogout} style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--color-accent)',
              cursor: 'pointer',
              padding: '0.25em 0.7em'
            }}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;