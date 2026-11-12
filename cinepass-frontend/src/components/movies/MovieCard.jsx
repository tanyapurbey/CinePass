import { Link } from 'react-router-dom'
import { FiClock } from 'react-icons/fi'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDate } from '../../utils/formatters'

export default function MovieCard({ movie, badge }) {
  return (
    <Link to={`/movies/${movie.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md" padding={false}>
        <div className="aspect-[2/3] overflow-hidden bg-off-white">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-muted">
              No poster
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-navy">
              {movie.title}
            </h3>
            {badge && <Badge status={badge}>{badge}</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-muted">
            {movie.genre && <span>{movie.genre}</span>}
            {movie.language && (
              <>
                <span>·</span>
                <span>{movie.language}</span>
              </>
            )}
          </div>
          {movie.durationMins && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-muted">
              <FiClock size={12} />
              <span>{movie.durationMins} min</span>
            </div>
          )}
          {movie.releaseDate && (
            <p className="mt-1 text-xs text-slate-muted">
              {formatDate(movie.releaseDate)}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
