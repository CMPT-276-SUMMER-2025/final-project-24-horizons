import './dashboard.css'

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

export function Dashboard() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: '70px' }}>
        <h2>PUT THE DASHBOARD HERE</h2>
        {/* Add more dashboard content here */}
      </div>
    </>
  )
}