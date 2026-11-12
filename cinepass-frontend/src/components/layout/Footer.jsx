import { Link } from 'react-router-dom'
import { FiFilm } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-navy">
          <FiFilm className="text-accent" size={16} />
          <span className="text-sm font-medium">CinePass</span>
        </div>
        <p className="text-xs text-slate-muted">
          Premium movie booking experience. Built with React & Spring Boot.
        </p>
        <div className="flex gap-4 text-xs text-slate-muted">
          <Link to="/movies" className="hover:text-charcoal">Movies</Link>
          <Link to="/login" className="hover:text-charcoal">Sign in</Link>
        </div>
      </div>
    </footer>
  )
}

