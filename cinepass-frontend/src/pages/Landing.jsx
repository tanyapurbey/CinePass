import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiSearch, FiShield, FiFilm, FiCheckCircle } from 'react-icons/fi'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card-bg via-main-bg to-main-bg pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                PREMIUM CINEMA BOOKING
              </div>

              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-primary-text sm:text-5xl lg:text-6xl leading-[1.1]">
                Book Movie Tickets with{' '}
                <span className="bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">
                  Zero Hassle.
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-secondary-text sm:text-lg lg:mx-0">
                Discover trending blockbusters, select your preferred cinema screens, lock seats in real time, and confirm your reservation with seamless payment.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                {isAuthenticated ? (
                  <Link to="/movies">
                    <Button size="lg" className="shadow-md shadow-primary/20">
                      Browse Movies
                      <FiArrowRight size={18} />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="shadow-md shadow-primary/20">
                        Create Account
                        <FiArrowRight size={18} />
                      </Button>
                    </Link>
                    <Link to="/movies">
                      <Button variant="secondary" size="lg">
                        Explore Movies
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-secondary-text">
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-600" size={15} /> Real-Time Seat Locking
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-600" size={15} /> Instant Digital Tickets
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-600" size={15} /> 100% Secure Checkout
                </span>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl border border-border bg-card-bg p-6 sm:p-8 shadow-xl shadow-slate-900/5">
                <div className="flex items-center justify-between border-b border-border/80 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                      <FiFilm size={14} />
                    </div>
                    <span className="font-heading text-sm font-bold text-primary-text">Why CinePass?</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">ENTERPRISE</span>
                </div>

                <div className="mt-5 space-y-4">
                  <FeatureRow
                    icon={FiSearch}
                    title="Intelligent Discovery"
                    desc="Filter by language, genre, and show timings across multiple cinema chains."
                  />
                  <FeatureRow
                    icon={FiCalendar}
                    title="Smart 5-Min Seat Lock"
                    desc="Pessimistic locking prevents double bookings during checkout."
                  />
                  <FeatureRow
                    icon={FiShield}
                    title="Protected & Encrypted"
                    desc="Stateless JWT authentication and role-based permissions."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Simple & Fast</p>
          <h2 className="font-heading text-2xl font-extrabold text-primary-text sm:text-3xl">
            How CinePass Works
          </h2>
          <p className="text-sm text-secondary-text">From selection to ticket reservation in less than two minutes.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Choose Movie',
              text: 'Browse the latest blockbuster releases, cast details, runtime, and trailers.',
            },
            {
              step: '02',
              title: 'Select Screen & Seat',
              text: 'Pick your preferred theatre, screen time, and interactive seats with real-time availability.',
            },
            {
              step: '03',
              title: 'Instant Confirmation',
              text: 'Securely pay using UPI, card, or wallet and get your digital booking reference instantly.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-border bg-card-bg p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all duration-200"
            >
              <span className="font-heading text-2xl font-black text-rose-200/90">{item.step}</span>
              <h3 className="mt-3 font-heading text-base font-bold text-primary-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-text">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function FeatureRow({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-primary">
        <Icon size={17} />
      </div>
      <div>
        <h4 className="font-heading text-sm font-bold text-primary-text">{title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-secondary-text">{desc}</p>
      </div>
    </div>
  )
}
