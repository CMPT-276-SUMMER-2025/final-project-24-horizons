import './App.css'

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Calendar', href: '#' },
  { name: 'Settings', href: '/settings' },
]


function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">StudySync</div>
        <div className="navbar-links">
          {navLinks.map(link => (
            <Link key={link.name} to={link.href}>{link.name}</Link>
          ))}
        </div>
      </div>
    </nav>
  )
}



function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ marginTop: '70px' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<h2>Calendar Page</h2>} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
      
}


export default App
