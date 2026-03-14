import { useState } from 'react'
import { useLang } from '../../context/LangContext'
import { feedbackAPI } from '../../services/api'
import styles from './FeedbackPage.module.css'

export default function FeedbackPage() {
  const { t } = useLang()
  const tableId = localStorage.getItem('tableId') || '1'
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!rating) return
    setLoading(true)
    await feedbackAPI.create({ tableId: Number(tableId), rating, comment })
    setSent(true)
  }

  if (sent) return (
    <div className={styles.thanks}>
      <div className={styles.thanksIcon}>🙏</div>
      <h2>Cảm ơn bạn!</h2>
      <p>Thank you for your feedback!</p>
      <div className={styles.stars}>{'⭐'.repeat(rating)}</div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t.feedback}</h2>
        <p className={styles.sub}>Chia sẻ trải nghiệm của bạn · Share your experience</p>

        <div className={styles.stars}>
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              className={`${styles.star} ${s <= (hover || rating) ? styles.starActive : ''}`}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
            >★</button>
          ))}
        </div>
        {rating > 0 && (
          <p className={styles.ratingLabel}>
            {['','😞 Tệ','😕 Bình thường','😊 Ổn','😄 Tốt','🤩 Tuyệt vời!'][rating]}
          </p>
        )}

        <textarea
          className={styles.textarea}
          placeholder={t.yourComment}
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
        />

        <button
          className={`btn btn-primary btn-lg ${styles.submitBtn}`}
          onClick={handleSend}
          disabled={!rating || loading}
        >
          {loading ? '...' : `${t.send} ⭐`}
        </button>
      </div>
    </div>
  )
}
