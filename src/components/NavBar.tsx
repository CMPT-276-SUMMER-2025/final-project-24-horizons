import './NavBar.css';
import { Link } from 'react-router-dom';
import { useTimer } from '../services/TimerContext';


const navLinks = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Calendar', to: '/calendar' },
  { name: 'Study', to: '/study' },
  { name: 'Settings', to: '/settings' },
];

function Navbar() {
  const { isRunning, timeLeft, stopTimer } = useTimer();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">StudySync</div>

        {isRunning && (
          <div className="navbar-timer">
            <span className="timer-display">{formatTime(timeLeft)}</span>
            <button className="stop-button" onClick={stopTimer}>Stop</button>
          </div>
        )}

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