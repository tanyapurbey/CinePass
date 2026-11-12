import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiBarChart2,
  FiCalendar,
  FiFilm,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUsers,
  FiX,
  FiMapPin,
  FiClipboard,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/movies', label: 'Movies', icon: FiFilm },
  { to: '/admin/theaters', label: 'Theatres', icon: FiMapPin },
  { to: '/admin/shows', label: 'Shows', icon: FiCalendar },
  { to: '/admin/bookings', label: 'Bookings', icon: FiClipboard },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-accent'
        : 'text-slate-muted hover:bg-off-white hover:text-charcoal'
    }`

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-muted">
          Admin
        </p>
        <p className="mt-1 text-sm font-semibold text-navy">CinePass</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <NavLink
          to="/dashboard"
          className="mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-muted hover:bg-off-white hover:text-charcoal"
        >
          <FiBarChart2 size={16} />
          User View
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-muted hover:bg-off-white hover:text-charcoal"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-off-white">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/20"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-56 bg-surface shadow-lg">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
          <button
            type="button"
            className="lg:hidden text-charcoal"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FiMenu size={20} />
          </button>
          <h2 className="text-sm font-semibold text-navy">Administration</h2>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

