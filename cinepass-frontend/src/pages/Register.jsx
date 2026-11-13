import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiFilm } from 'react-icons/fi'
import { authService } from '../api/authService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorAlert from '../components/common/ErrorAlert'
import { getErrorMessage } from '../utils/formatters'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register(form)
      navigate('/login', {
        state: { message: 'Account created. Please sign in.' },
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Icon & Heading */}
        <div className="mb-8 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-primary shadow-xs">
            <FiFilm size={24} />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-primary-text sm:text-3xl">
            Create an Account
          </h1>
          <p className="text-sm text-secondary-text">
            Join CinePass to reserve seats and track cinema bookings
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-border bg-card-bg p-7 sm:p-8 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

            <Input
              label="Full Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Tanya Sharma"
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Input
              label="Phone Number"
              required
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />

            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" loading={loading}>
                Complete Registration
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-border/80 pt-5 text-center text-xs text-secondary-text">
            <span>Already have a CinePass account? </span>
            <Link to="/login" className="font-bold text-primary hover:text-primary-hover">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
