import './App.css'

const navLinks = [
  { name: 'Home', href: '#' },
  { name: 'About', href: '#' },
  { name: 'Contact', href: '#' },
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
    <>
      <Navbar />
      <div style={{ marginTop: '70px' }}>
        {/* Main content goes here */}
      </div>
    </>
  )
}

export default App
