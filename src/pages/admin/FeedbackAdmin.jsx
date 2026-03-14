import { useState, useEffect } from 'react'
import { feedbackAPI } from '../../services/api'
import styles from './FeedbackAdmin.module.css'

export default function FeedbackAdmin() {
  const [list, setList] = useState([])
  const [avg, setAvg]   = useState(null)

  useEffect(() => {
    feedbackAPI.getAll().then(r => setList(r.data))
    feedbackAPI.getAvg().then(r => setAvg(r.data.averageRating))
  }, [])

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>⭐ Feedback khách hàng</h1>

      {avg !== null && (
        <div className={styles.avgCard}>
          <div className={styles.avgNum}>{avg ? avg.toFixed(1) : '—'}</div>
          <div>
            <div className={styles.avgStars} style={{ color: '#F59E0B' }}>{avg ? stars(Math.round(avg)) : '☆☆☆☆☆'}</div>
            <div className={styles.avgLabel}>Điểm trung bình từ {list.length} đánh giá</div>
          </div>
        </div>
      )}

      <div className={styles.list}>
        {list.length === 0 ? (
          <p className={styles.empty}>Chưa có đánh giá nào</p>
        ) : list.map(fb => (
          <div key={fb.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <span className={styles.tableTag}>Bàn {fb.tableNumber}</span>
                <span className={styles.starsDisplay} style={{ color: '#F59E0B' }}>{stars(fb.rating)}</span>
              </div>
              <span className={styles.time}>
                {new Date(fb.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {fb.comment && <p className={styles.comment}>{fb.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
