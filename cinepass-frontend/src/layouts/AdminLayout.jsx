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
  FiArrowLeft,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/movies', label: 'Movies Catalog', icon: FiFilm },
  { to: '/admin/theaters', label: 'Theatres & Screens', icon: FiMapPin },
  { to: '/admin/shows', label: 'Show Schedules', icon: FiCalendar },
  { to: '/admin/bookings', label: 'All Bookings', icon: FiClipboard },
  { to: '/admin/users', label: 'User Accounts', icon: FiUsers },
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
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-primary text-white shadow-xs font-bold'
        : 'text-slate-400 hover:bg-secondary-dark hover:text-white'
    }`

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-slate-300">
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
          <FiFilm size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-sm font-extrabold text-white">CinePass</span>
            <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">ADMIN</span>
          </div>
          <p className="text-[11px] text-slate-400">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-3.5">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800/80 p-3.5 space-y-1">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-secondary-dark hover:text-white"
        >
          <FiArrowLeft size={14} />
          <span>Exit to Main Site</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <FiLogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-main-bg">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800/80 md:block">
        <div className="fixed inset-y-0 w-64">{sidebar}</div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-sidebar/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-xs">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card-bg/90 px-4 sm:px-6 backdrop-blur-md">
          <button
            type="button"
            className="rounded-lg p-2 text-primary-text md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-secondary-text">
              Cinema Admin Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
