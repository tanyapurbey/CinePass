import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiFilm, FiMenu, FiX, FiLogOut } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const userLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/movies', label: 'Movies' },
  { to: '/bookings', label: 'My Bookings' },
]

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-accent' : 'text-slate-muted hover:text-charcoal'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-navy">
          <FiFilm className="text-accent" size={20} />
          <span className="text-sm font-semibold tracking-tight">CinePass</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <>
              {userLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              )}
              <NavLink to="/profile" className={navClass}>
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-muted hover:text-charcoal"
              >
                <FiLogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/movies" className={navClass}>
                Movies
              </NavLink>
              <Link to="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden text-charcoal"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                {userLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={navClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={navClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </NavLink>
                )}
                <NavLink
                  to="/profile"
                  className={navClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Profile ({user?.email})
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout()
                    setMobileOpen(false)
                  }}
                  className="text-left text-sm font-medium text-slate-muted"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/movies"
                  className={navClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Movies
                </NavLink>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Sign in</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

