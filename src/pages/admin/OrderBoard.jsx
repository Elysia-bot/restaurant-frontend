import { useState, useEffect, useRef } from 'react'
import { orderAPI } from '../../services/api'
import { Client } from '@stomp/stompjs'

import styles from './OrderBoard.module.css'

const COLS = [
  { status: 'PENDING',   label: 'Chờ xác nhận', emoji: '🔴', next: 'PREPARING', nextLabel: '✓ Bắt đầu làm',  color: '#F59E0B' },
  { status: 'PREPARING', label: 'Đang làm',      emoji: '🟡', next: 'COMPLETED', nextLabel: '✓ Đã phục vụ',  color: '#10B981' },
  { status: 'COMPLETED', label: 'Hoàn thành',    emoji: '✅', next: null,        nextLabel: null,             color: '#6B7280' },
]

export default function OrderBoard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [newOrderIds, setNewOrderIds] = useState(new Set())
  const audioRef = useRef(null)

  const load = () => {
    orderAPI.getAll().then(r => {
      setOrders(r.data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  // Auto-refresh every 30s
  useEffect(() => {
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  // WebSocket for all tables
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new WebSocket(
        `ws://${window.location.hostname}:8080/ws/websocket`
      ),
      onConnect: () => {
        // Subscribe broadly - re-load on any update
        for (let i = 1; i <= 20; i++) {
          client.subscribe(`/topic/orders/${i}`, () => load())
        }
      }
    })
    client.activate()
    return () => client.deactivate()
  }, [])

  // Poll for new orders
  useEffect(() => {
    const iv = setInterval(async () => {
      const res = await orderAPI.getAll()
      const incoming = res.data
      const currentIds = new Set(orders.map(o => o.id))
      const brandNew = incoming.filter(o => !currentIds.has(o.id) && o.status === 'PENDING')
      if (brandNew.length > 0) {
        setNewOrderIds(prev => new Set([...prev, ...brandNew.map(o => o.id)]))
        setTimeout(() => setNewOrderIds(new Set()), 5000)
        setOrders(incoming)
      }
    }, 8000)
    return () => clearInterval(iv)
  }, [orders])

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(p => ({ ...p, [orderId]: true }))
    await orderAPI.updateStatus(orderId, newStatus)
    load()
    setUpdating(p => ({ ...p, [orderId]: false }))
  }

  const byStatus = (status) => orders.filter(o => o.status === status)

  const totalPending   = byStatus('PENDING').length
  const totalPreparing = byStatus('PREPARING').length

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadSpinner} />
      <p>Đang tải đơn hàng...</p>
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>📋 Quản lý đơn hàng</h1>
          <span className={styles.liveChip}>● LIVE</span>
        </div>
        <div className={styles.topStats}>
          <div className={styles.statChip} style={{ background: '#FEF3C7', color: '#92400E' }}>
            <span className={styles.statNum}>{totalPending}</span>
            <span>Chờ xác nhận</span>
          </div>
          <div className={styles.statChip} style={{ background: '#D1FAE5', color: '#065F46' }}>
            <span className={styles.statNum}>{totalPreparing}</span>
            <span>Đang làm</span>
          </div>
          <div className={styles.statChip} style={{ background: '#F3F4F6', color: '#374151' }}>
            <span className={styles.statNum}>{byStatus('COMPLETED').length}</span>
            <span>Hoàn thành</span>
          </div>
          <button className={styles.refreshBtn} onClick={load}>🔄 Làm mới</button>
        </div>
      </div>

      {/* Kanban board */}
      <div className={styles.board}>
        {COLS.map(col => (
          <div key={col.status} className={styles.col}>
            <div className={styles.colHeader} style={{ borderTopColor: col.color }}>
              <span className={styles.colEmoji}>{col.emoji}</span>
              <span className={styles.colLabel}>{col.label}</span>
              <span className={styles.colCount} style={{ background: col.color }}>
                {byStatus(col.status).length}
              </span>
            </div>

            <div className={styles.cards}>
              {byStatus(col.status).length === 0 ? (
                <div className={styles.emptyCol}>Không có đơn</div>
              ) : (
                byStatus(col.status).map(order => (
                  <div
                    key={order.id}
                    className={`${styles.card} ${newOrderIds.has(order.id) ? styles.newCard : ''} ${col.status === 'PENDING' ? styles.cardUrgent : ''}`}
                  >
                    {/* Card header */}
                    <div className={styles.cardTop}>
                      <div className={styles.cardMeta}>
                        <span className={styles.tableNum}>🪑 Bàn {order.tableNumber}</span>
                        <span className={styles.orderId}>#{order.id}</span>
                      </div>
                      <div className={styles.cardTime}>
                        {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Items list — very prominent */}
                    <div className={styles.itemsList}>
                      {order.items?.map(item => (
                        <div key={item.id} className={styles.itemRow}>
                          <span className={styles.itemQtyBig}>×{item.quantity}</span>
                          <span className={styles.itemNameBig}>{item.menuItemName}</span>
                        </div>
                      ))}
                    </div>

                    {/* Kitchen note */}
                    {order.personalNote && (
                      <div className={styles.kitchenNote}>
                        📝 {order.personalNote}
                      </div>
                    )}

                    {/* Total */}
                    <div className={styles.cardFooter}>
                      <span className={styles.totalLabel}>Tổng</span>
                      <span className={styles.totalAmt}>
                        {Number(order.totalPrice).toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    {/* Action button */}
                    {col.next && (
                      <button
                        className={`${styles.actionBtn} ${col.status === 'PENDING' ? styles.actionBtnStart : styles.actionBtnDone}`}
                        onClick={() => updateStatus(order.id, col.next)}
                        disabled={updating[order.id]}
                      >
                        {updating[order.id] ? '...' : col.nextLabel}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
