import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiSearch, FiShield } from 'react-icons/fi'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Premium movie booking
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              CinePass
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-muted">
              Discover movies, pick your preferred showtime, select seats, and
              complete your booking in minutes. A clean, production-ready
              experience built on your Spring Boot backend.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to="/movies">
                  <Button size="lg">
                    Browse Movies
                    <FiArrowRight size={16} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">
                      Get Started
                      <FiArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg">
                      Sign in
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-off-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Feature
                icon={FiSearch}
                title="Search & Discover"
                description="Find current and upcoming movies by title, genre, or language."
              />
              <Feature
                icon={FiCalendar}
                title="Smart Booking"
                description="Lock seats, pay securely, and manage your booking history."
              />
              <Feature
                icon={FiShield}
                title="Secure Access"
                description="JWT-authenticated API integration with role-based admin tools."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-lg font-semibold text-navy">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { step: '01', title: 'Choose a movie', text: 'Browse now showing and upcoming releases.' },
            { step: '02', title: 'Pick a show', text: 'Select theatre, screen, and showtime.' },
            { step: '03', title: 'Book seats', text: 'Lock seats, confirm payment, get your ticket.' },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <span className="text-xs font-medium text-accent">{item.step}</span>
              <h3 className="mt-2 text-sm font-semibold text-navy">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <Icon className="text-accent" size={18} />
      <h3 className="mt-2 text-sm font-semibold text-navy">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-muted">{description}</p>
    </div>
  )
}

