import { useState } from 'react'
import { useLang } from '../../context/LangContext'
import { orderAPI } from '../../services/api'
import styles from './OrderCart.module.css'

export default function OrderCart({ cart, updateQty, onClose, onOrdered }) {
  const { t } = useLang()
  const tableId = localStorage.getItem('tableId') || '1'
  const tableNumber = localStorage.getItem('tableNumber') || '1'
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await orderAPI.create({
        tableId: Number(tableId),
        personalNote: note,
        items: cart.map(c => ({ menuItemId: c.id, quantity: c.qty }))
      })

      console.log('payload:', payload)
      await orderAPI.create(payload)
      
      setDone(true)
      setTimeout(() => { onOrdered() }, 1800)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        {done ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✅</div>
            <h3>{t.orderConfirmed}</h3>
            <p>{t.table} {tableNumber}</p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>{t.confirmOrder}</h2>
              <div className={styles.tableBadge}>{t.table} {tableNumber}</div>
            </div>

            {/* Items */}
            <div className={styles.items}>
              <div className={styles.tableHead}>
                <span>{t.menu}</span>
                <span>{t.qty}</span>
                <span>{t.unitPrice}</span>
                <span>{t.subtotal}</span>
              </div>
              {cart.map(item => (
                <div key={item.id} className={styles.row}>
                  <span className={styles.itemName}>{item.name}</span>
                  <div className={styles.qtyControl}>
                    <button onClick={() => updateQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, +1)}>+</button>
                  </div>
                  <span className={styles.price}>{Number(item.price).toLocaleString('vi-VN')}₫</span>
                  <span className={styles.sub}>{(item.price * item.qty).toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className={styles.totalRow}>
              <span>{t.total}</span>
              <span className={styles.totalAmt}>{total.toLocaleString('vi-VN')}₫</span>
            </div>

            {/* Payment note */}
            <div className={styles.payNote}>
              💵 {t.payAtCounter}
            </div>

            {/* Kitchen note */}
            <textarea
              className={styles.noteInput}
              placeholder={t.note}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
            />

            {/* Actions */}
            <div className={styles.actions}>
              <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? '...' : `✓ ${t.confirm}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
