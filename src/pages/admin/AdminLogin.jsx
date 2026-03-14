import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await authAPI.login(form)
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem('adminName', res.data.fullName)
      navigate('/admin')
    } catch {
      setError('Sai username hoặc password')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleLogin}>
        <div className={styles.logoArea}>
          <span className={styles.logo}>🍚</span>
          <h1 className={styles.brand}>Cơm Quê Hương</h1>
          <p className={styles.role}>Admin Portal</p>
        </div>

        <div className={styles.field}>
          <label>Username</label>
          <input
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            placeholder="admin"
            autoFocus
          />
        </div>
        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.btn} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
        </button>
      </form>
    </div>
  )
}
