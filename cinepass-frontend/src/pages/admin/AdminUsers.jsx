import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUsers, FiMail, FiPhone } from 'react-icons/fi'
import { userService } from '../../api/userService'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import Modal, { ModalActions } from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { getErrorMessage } from '../../utils/formatters'

const emptyForm = { name: '', email: '', phoneNumber: '', password: '' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadUsers = () => {
    setLoading(true)
    userService
      .getAll()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      password: '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await userService.update(editing.id, {
          id: editing.id,
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          role: editing.role,
        })
      } else {
        await userService.create({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
        })
      }
      setModalOpen(false)
      loadUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account?')) return
    try {
      await userService.delete(id)
      loadUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts"
        description="Inspect registered customers and system administrators."
        action={
          <Button size="sm" onClick={openCreate} className="shadow-xs">
            <FiPlus size={15} />
            Add User Account
          </Button>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {users.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No users found"
          description="Users will appear here once they register or are added manually."
          action={<Button size="sm" onClick={openCreate}>Add User</Button>}
        />
      ) : (
        <Card padding={false} className="overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-secondary-text">
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone Number</th>
                  <th className="px-4 py-3.5">System Role</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-xs font-bold text-primary">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-heading font-bold text-primary-text">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-secondary-text">
                      {user.email}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-secondary-text">
                      {user.phoneNumber || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={user.role}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user)} title="Edit User">
                          <FiEdit2 size={14} className="text-secondary-text hover:text-primary-text" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} title="Delete User">
                          <FiTrash2 size={14} className="text-red-500 hover:text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User Details' : 'Create User Account'}
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onConfirm={handleSave}
            loading={saving}
            confirmLabel={editing ? 'Update User' : 'Create Account'}
          />
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer Name" />
          <Input label="Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
          <Input label="Phone Number" required={!editing} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="+91 98765 43210" />
          {!editing && (
            <Input
              label="Account Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
