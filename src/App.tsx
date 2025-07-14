import './App.css'

const navLinks = [
  { name: 'Dashboard', href: '#' },
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
    <>
      <Navbar />
      <div style={{ marginTop: '70px' }}>
        {/* once we figure out the other pages, we'll add the code here*/}
      </div>
    </>
  )
}

export default App
