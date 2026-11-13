import { Link } from 'react-router-dom'
import { FiClock, FiPlayCircle, FiCalendar } from 'react-icons/fi'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDate } from '../../utils/formatters'

export default function MovieCard({ movie, badge }) {
  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card-bg shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_12px_24px_-8px_rgba(225,29,72,0.15)]">
        {/* Poster Image Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
              <FiPlayCircle size={32} />
              <span className="text-xs font-semibold">No Poster Available</span>
            </div>
          )}

          {/* Top Badge overlay */}
          {badge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge status={badge}>{badge}</Badge>
            </div>
          )}

          {/* Quick Info Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar/90 via-sidebar/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md">
              Book Tickets
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-heading text-base font-bold text-primary-text line-clamp-1 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-secondary-text">
            {movie.genre && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                {movie.genre}
              </span>
            )}
            {movie.language && (
              <span className="rounded-md bg-rose-50 px-2 py-0.5 font-semibold text-primary">
                {movie.language}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs text-secondary-text">
            {movie.durationMins ? (
              <span className="flex items-center gap-1 font-medium">
                <FiClock size={12} className="text-primary" />
                {movie.durationMins}m
              </span>
            ) : <span />}
            {movie.releaseDate && (
              <span className="text-[11px] text-slate-400">
                {formatDate(movie.releaseDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
