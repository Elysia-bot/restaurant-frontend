import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { supportAPI } from '../../services/api'
import styles from './AdminLayout.module.css'

const NAV = [
  { path: '/admin',          icon: '📋', label: 'Đơn hàng', key: 'orders' },
  { path: '/admin/menu',     icon: '🍽️', label: 'Thực đơn', key: 'menu'   },
  { path: '/admin/stats',    icon: '📊', label: 'Thống kê', key: 'stats'  },
  { path: '/admin/feedback', icon: '⭐', label: 'Feedback',  key: 'fb'    },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const adminName = localStorage.getItem('adminName') || 'Admin'
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    supportAPI.unreadCount().then(r => setUnread(r.data.unreadCount))
    const iv = setInterval(() => {
      supportAPI.unreadCount().then(r => setUnread(r.data.unreadCount))
    }, 15000)
    return () => clearInterval(iv)
  }, [])

  const logout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <span className={styles.sideIcon}>🍚</span>
          <div>
            <div className={styles.sideBrand}>Admin</div>
            <div className={styles.sideName}>{adminName}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map(n => (
            <button
              key={n.key}
              className={`${styles.navItem} ${location.pathname === n.path ? styles.navActive : ''}`}
              onClick={() => navigate(n.path)}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              <span className={styles.navLabel}>{n.label}</span>
              {n.key === 'orders' && (
                <span className={styles.liveTag}>LIVE</span>
              )}
            </button>
          ))}
        </nav>

        {unread > 0 && (
          <div className={styles.msgAlert}>
            💬 <strong>{unread}</strong> tin nhắn chưa đọc
          </div>
        )}

        <button className={styles.logoutBtn} onClick={logout}>
          🚪 Đăng xuất
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
