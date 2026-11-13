import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiFilm, FiMenu, FiX, FiLogOut, FiUser, FiCompass } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const userLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/movies', label: 'Browse Movies' },
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
    `relative px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
      isActive
        ? 'bg-rose-50 text-primary font-bold'
        : 'text-secondary-text hover:text-primary-text hover:bg-slate-100/70'
    }`

  const mobileNavClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
      isActive
        ? 'bg-rose-50 text-primary font-bold'
        : 'text-secondary-text hover:text-primary-text hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
            <FiFilm size={18} />
          </div>
          <span className="font-heading text-lg font-extrabold tracking-tight text-primary-text">
            Cine<span className="text-primary">Pass</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              {userLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" className={navClass}>
                  Admin Portal
                </NavLink>
              )}

              <div className="mx-2 h-4 w-px bg-border" />

              <NavLink
                to="/profile"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-secondary-text transition-colors hover:bg-slate-100/70 hover:text-primary-text"
                title="Profile"
              >
                <FiUser size={15} />
                <span>Profile</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-secondary-text transition-colors hover:bg-rose-50 hover:text-primary"
              >
                <FiLogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/movies" className={navClass}>
                <span className="flex items-center gap-1.5">
                  <FiCompass size={15} />
                  Browse Movies
                </span>
              </NavLink>
              <div className="ml-2 flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Get Tickets
                  </Button>
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-primary-text md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-border bg-card-bg px-4 pt-2 pb-5 md:hidden">
          <nav className="space-y-1">
            {isAuthenticated ? (
              <>
                {userLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={mobileNavClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={mobileNavClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Portal
                  </NavLink>
                )}
                <NavLink
                  to="/profile"
                  className={mobileNavClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <FiUser size={16} />
                  Profile
                </NavLink>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-error"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/movies"
                  className={mobileNavClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <FiCompass size={16} />
                  Browse Movies
                </NavLink>
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
