import { useState, useEffect } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { menuAPI } from '../../services/api'
import styles from './ItemDetail.module.css'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()
  const { addToCart } = useOutletContext()
  const [item, setItem] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    menuAPI.getById(id).then(r => setItem(r.data))
  }, [id])

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (!item) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
    </div>
  )

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>← {t.menu}</button>

      <div className={styles.hero}>
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className={styles.heroImg} />
          : <div className={styles.heroPlaceholder}>🍜</div>
        }
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.itemId}>#{item.id}</span>
          <span className={styles.catTag}>{item.categoryName}</span>
        </div>
      </div>

      <div className={styles.content}>
        <h1 className={styles.name}>{item.name}</h1>
        <p className={styles.price}>{Number(item.price).toLocaleString('vi-VN')}₫</p>
        {item.description && <p className={styles.desc}>{item.description}</p>}

        <div className={styles.actions}>
          <div className={styles.qtyControl}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <button
            className={`btn btn-primary btn-lg ${styles.addBtn} ${added ? styles.addedAnim : ''}`}
            onClick={handleAdd}
          >
            {added ? '✓ Đã thêm!' : `+ ${t.addToOrder}`}
          </button>
        </div>
      </div>
    </div>
  )
}
