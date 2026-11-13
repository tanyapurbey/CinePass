import { useEffect, useState } from 'react'
import { FiUser, FiCheckCircle } from 'react-icons/fi'
import { userService } from '../api/userService'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/layout/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { getErrorMessage } from '../utils/formatters'

export default function Profile() {
  const { user, updateStoredUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    userService
      .getById(user.id)
      .then((res) => {
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          phoneNumber: res.data.phoneNumber || '',
        })
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [user.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await userService.update(user.id, {
        id: user.id,
        ...form,
        role: user.role,
      })
      updateStoredUser({ email: data.email })
      setSuccess('Your profile has been updated successfully.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <PageHeader
        title="Personal Profile"
        description="Manage your CinePass account details & phone number."
        action={<Badge status={user.role}>{user.role}</Badge>}
      />

      {error && <div className="mb-4"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}
      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs font-bold text-emerald-900 shadow-2xs">
          <FiCheckCircle className="text-emerald-600" size={16} />
          <span>{success}</span>
        </div>
      )}

      <Card className="shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your Name"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />

          <Input
            label="Phone Number"
            required
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            placeholder="+91 98765 43210"
          />

          <div className="pt-2">
            <Button type="submit" size="md" className="w-full shadow-xs" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
