import { Link } from 'react-router-dom'
import { FiFilm, FiShield, FiHeart } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-sidebar text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <FiFilm size={16} />
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-white">
              Cine<span className="text-primary">Pass</span>
            </span>
            <span className="ml-2 rounded-full border border-slate-700 bg-secondary-dark px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
              CINEMA ENGINE
            </span>
          </div>

          <p className="text-center text-xs text-slate-400 sm:text-left">
            Next-generation movie reservation platform built with modern architecture.
          </p>

          <div className="flex items-center gap-5 text-xs font-medium text-slate-300">
            <Link to="/movies" className="transition-colors hover:text-white">
              Now Showing
            </Link>
            <Link to="/login" className="transition-colors hover:text-white">
              Sign In
            </Link>
            <span className="flex items-center gap-1 text-slate-500">
              <FiShield size={12} /> Secure Checkout
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CinePass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
