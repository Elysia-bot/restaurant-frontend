import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { orderAPI, supportAPI } from '../../services/api'
import { Client } from '@stomp/stompjs'

import styles from './GuestLayout.module.css'
import OrderCart from '../../components/guest/OrderCart'

export default function GuestLayout() {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const tableNumber = localStorage.getItem('tableNumber') || '1'
  const tableId = localStorage.getItem('tableId') || '1'

  const [cart, setCart] = useState([])          // items being built
  const [orders, setOrders] = useState([])       // confirmed orders
  const [showCart, setShowCart] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [supportMsg, setSupportMsg] = useState('')
  const [hasActiveOrders, setHasActiveOrders] = useState(false)
  const [orderPulse, setOrderPulse] = useState(false)
  const stompRef = useRef(null)

  // Load existing orders
  const loadOrders = () => {
    orderAPI.getByTable(tableId).then(r => {
      setOrders(r.data)
      const active = r.data.some(o => o.status !== 'COMPLETED')
      setHasActiveOrders(active)
    })
  }

  useEffect(() => { loadOrders() }, [])

  // WebSocket for realtime order status
  useEffect(() => {
    const client = new Client({
   webSocketFactory: () => new WebSocket(
  'wss://restaurant-backend-production-7837.up.railway.app/ws/websocket'
),
      onConnect: () => {
        client.subscribe(`/topic/orders/${tableId}`, msg => {
          const update = JSON.parse(msg.body)
          setOrders(prev => prev.map(o =>
            o.id === update.orderId ? { ...o, status: update.status } : o
          ))
          setOrderPulse(true)
          setTimeout(() => setOrderPulse(false), 3000)
          loadOrders()
        })
      }
    })
    client.activate()
    stompRef.current = client
    return () => client.deactivate()
  }, [tableId])

  const addToCart = (item) => {
    setCart(prev => {
      const found = prev.find(c => c.id === item.id)
      if (found) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev => {
      const next = prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c)
      return next.filter(c => c.qty > 0)
    })
  }

  const sendSupport = async () => {
    if (!supportMsg.trim()) return
    await supportAPI.create({ tableId: Number(tableId), message: supportMsg })
    setSupportMsg('')
    setShowSupport(false)
  }

  const isMenu = location.pathname === '/menu'
  const isOrders = location.pathname === '/menu/orders'
  const isFeedback = location.pathname === '/menu/feedback'

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.tableTag}>
            <span className={styles.tableLabel}>{t.table}</span>
            <span className={styles.tableNum}>{tableNumber}</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${isMenu ? styles.active : ''}`}
            onClick={() => navigate('/menu')}
            title={t.menu}
          >
            <span className={styles.navIcon}>🍽️</span>
            <span className={styles.navLabel}>{t.menu}</span>
          </button>

          <button
            className={`${styles.navBtn} ${isOrders ? styles.active : ''} ${hasActiveOrders ? styles.hasOrders : ''} ${orderPulse ? styles.pulse : ''}`}
            onClick={() => navigate('/menu/orders')}
            title={t.order}
          >
            <span className={styles.navIcon}>📋</span>
            <span className={styles.navLabel}>{t.order}</span>
            {hasActiveOrders && <span className={styles.dot} />}
          </button>

          <button
            className={`${styles.navBtn} ${isFeedback ? styles.active : ''}`}
            onClick={() => navigate('/menu/feedback')}
            title={t.feedback}
          >
            <span className={styles.navIcon}>⭐</span>
            <span className={styles.navLabel}>{t.feedback}</span>
          </button>
        </nav>

        <div className={styles.sideBottom}>
          <span className={styles.version}>{t.version} 1.0</span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <Outlet context={{ cart, addToCart, updateQty, setCart, orders, loadOrders }} />
      </main>

      {/* ── Cart FAB ── */}
      {cart.length > 0 &&  (
        <button className={styles.fab} onClick={() => setShowCart(true)}>
          <span>🛒</span>
          <span className={styles.fabCount}>{cart.reduce((s, c) => s + c.qty, 0)}</span>
          <span className={styles.fabLabel}>{t.viewOrder}</span>
        </button>
      )}

      {/* ── Cart modal ── */}
      {showCart && (
        <OrderCart
          cart={cart}
          updateQty={updateQty}
          onClose={() => setShowCart(false)}
          onOrdered={() => {
            setCart([])
            setShowCart(false)
            loadOrders()
            navigate('/menu')
          }}
        />
      )}

      {/* ── Support bubble ── */}
      <button className={styles.supportBubble} onClick={() => setShowSupport(true)} title={t.support}>
        💬
      </button>

      {showSupport && (
        <div className={styles.supportModal} onClick={() => setShowSupport(false)}>
          <div className={styles.supportCard} onClick={e => e.stopPropagation()}>
            <h4>💬 {t.support}</h4>
            <textarea
              value={supportMsg}
              onChange={e => setSupportMsg(e.target.value)}
              placeholder={t.typeMessage}
              rows={3}
            />
            <div className={styles.supportActions}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSupport(false)}>{t.cancel}</button>
              <button className="btn btn-primary btn-sm" onClick={sendSupport}>{t.send}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
