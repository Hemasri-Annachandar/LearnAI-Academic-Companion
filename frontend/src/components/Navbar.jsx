
import { NavLink } from 'react-router-dom'

function Navbar() {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: '⌂' },
    { label: 'My Library', path: '/library', icon: '▤' },
    { label: 'Search', path: '/search', icon: '⌕' },
    { label: 'Settings', path: '/settings', icon: '⚙' },
  ]

  return (
    <header className="app-navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        <span className="navbar-brand-icon">✦</span>
        <span>LearnAI</span>
      </NavLink>

      <nav className="navbar-navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'active' : ''}`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="navbar-profile"
        aria-label="Student profile"
      >
        <span className="navbar-avatar">S</span>
        <span className="navbar-profile-name">Student</span>
        <span className="navbar-profile-arrow">⌄</span>
      </button>
    </header>
  )
}

export default Navbar
