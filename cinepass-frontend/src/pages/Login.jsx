import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiFilm, FiLock, FiMail } from 'react-icons/fi'
import { authService } from '../api/authService'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorAlert from '../components/common/ErrorAlert'
import { getErrorMessage } from '../utils/formatters'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      login(data)
      navigate(data.role === 'ADMIN' ? '/admin' : from, { replace: true })
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
            Welcome Back
          </h1>
          <p className="text-sm text-secondary-text">
            Sign in to manage your tickets and cinema reservations
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-border bg-card-bg p-7 sm:p-8 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

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
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" loading={loading}>
              Sign In to CinePass
            </Button>
          </form>

          <div className="mt-6 border-t border-border/80 pt-5 text-center text-xs text-secondary-text">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="font-bold text-primary hover:text-primary-hover">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
