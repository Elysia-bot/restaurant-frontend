// OrdersPage.jsx
import { useOutletContext } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { orderAPI } from '../../services/api'
import styles from './OrdersPage.module.css'

export function OrdersPage() {
  const { t } = useLang()
  const { orders, loadOrders } = useOutletContext()

  const handleCancel = async (id) => {
    await orderAPI.cancel(id)
    loadOrders()
  }

  const statusLabel = (s) => ({
    PENDING:   { label: t.pending,   cls: 'badge-pending'   },
    PREPARING: { label: t.preparing, cls: 'badge-preparing' },
    COMPLETED: { label: t.completed, cls: 'badge-completed' }
  }[s] || { label: s, cls: '' })

  if (!orders.length) return (
    <div className={styles.empty}>
      <span>📋</span>
      <p>{t.noOrders}</p>
    </div>
  )

  const active = orders.filter(o => o.status !== 'COMPLETED')
  const done   = orders.filter(o => o.status === 'COMPLETED')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.order}</h2>
        {active.length > 0 && (
          <span className={styles.activeBadge}>{active.length} đang xử lý</span>
        )}
      </div>

      {/* Grand total of all active orders */}
      {active.length > 0 && (
        <div className={styles.grandTotal}>
          <span>Tổng tất cả đơn đang xử lý</span>
          <span className={styles.grandAmt}>
            {active.reduce((s, o) => s + Number(o.totalPrice), 0).toLocaleString('vi-VN')}₫
          </span>
        </div>
      )}

      {orders.map(order => {
        const { label, cls } = statusLabel(order.status)
        return (
          <div key={order.id} className={`${styles.card} ${order.status === 'PREPARING' ? styles.cardPreparing : ''}`}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.orderId}>Đơn #{order.id}</span>
                <span className={`badge ${cls}`}>{label}</span>
              </div>
              <div className={styles.cardRight}>
                <span className={styles.orderTotal}>{Number(order.totalPrice).toLocaleString('vi-VN')}₫</span>
                {order.status === 'PENDING' && (
                  <button className={styles.cancelBtn} onClick={() => handleCancel(order.id)}>✕</button>
                )}
              </div>
            </div>

            <div className={styles.items}>
              {order.items?.map(item => (
                <div key={item.id} className={styles.item}>
                  <span>{item.menuItemName}</span>
                  <span className={styles.itemQty}>×{item.quantity}</span>
                  <span className={styles.itemSub}>{Number(item.subTotal).toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>

            {order.personalNote && (
              <div className={styles.note}>📝 {order.personalNote}</div>
            )}

            {/* Status progress bar */}
            <div className={styles.progress}>
              {['PENDING','PREPARING','COMPLETED'].map((s, i) => (
                <div
                  key={s}
                  className={`${styles.step} ${
                    order.status === s ? styles.stepActive :
                    ['PENDING','PREPARING','COMPLETED'].indexOf(order.status) > i ? styles.stepDone : ''
                  }`}
                >
                  <div className={styles.stepDot} />
                  <span>{statusLabel(s).label}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OrdersPage
