import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Calendar', href: '#' },
  { name: 'Settings', href: '#' },
]

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">StudySync</div>
        <div className="navbar-links">
          {navLinks.map(link => (
            <a key={link.name} href={link.href}>{link.name}</a>
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
          {/* Add other routes */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
