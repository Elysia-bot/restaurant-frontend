import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { menuAPI, categoryAPI } from '../../services/api'
import styles from './MenuPage.module.css'

export default function MenuPage() {
  const { t } = useLang()
  const { addToCart, cart } = useOutletContext()
  const navigate = useNavigate()

  const [items, setItems]       = useState([])
  const [cats, setCats]         = useState([])
  const [selCat, setSelCat]     = useState(null)
  const [search, setSearch]     = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading]   = useState(true)
  const [added, setAdded]       = useState({})

  useEffect(() => {
    categoryAPI.getAll().then(r => setCats(r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search)   params.name = search
    if (selCat)   params.categoryId = selCat
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    menuAPI.getAll(params).then(r => {
      setItems(r.data)
      setLoading(false)
    })
  }, [search, selCat, minPrice, maxPrice])

  const handleAdd = (item) => {
    addToCart(item)
    setAdded(prev => ({ ...prev, [item.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [item.id]: false })), 1000)
  }

  const getCartQty = (id) => cart.find(c => c.id === id)?.qty || 0

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoArea}>
            <span className={styles.logoEmoji}>🍚</span>
            <div>
              <h1 className={styles.restaurantName}>Quán Cô Hoàn</h1>
              <p className={styles.subtitle}>{t.menu}</p>
            </div>
          </div>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={`${t.search} / ID`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.catScroll}>
          <button
            className={`${styles.catBtn} ${!selCat ? styles.catActive : ''}`}
            onClick={() => setSelCat(null)}
          >{t.allCategories}</button>
          {cats.map(c => (
            <button
              key={c.id}
              className={`${styles.catBtn} ${selCat === c.id ? styles.catActive : ''}`}
              onClick={() => setSelCat(c.id)}
            >{c.name}</button>
          ))}
        </div>
        <div className={styles.priceFilter}>
          <input
            type="number" placeholder="Min ₫"
            value={minPrice} onChange={e => setMinPrice(e.target.value)}
            className={styles.priceInput}
          />
          <span className={styles.priceDash}>—</span>
          <input
            type="number" placeholder="Max ₫"
            value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            className={styles.priceInput}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <span>🍽️</span>
          <p>Không tìm thấy món</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item, i) => (
            <div
              key={item.id}
              className={styles.card}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={styles.cardImg}
                onClick={() => navigate(`/menu/item/${item.id}`)}
              >
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} />
                  : <div className={styles.imgPlaceholder}>🍜</div>
                }
                <span className={styles.itemId}>#{item.id}</span>
                <span className={`${styles.catTag}`}>{item.categoryName}</span>
              </div>
              <div className={styles.cardBody}>
                <h3
                  className={styles.itemName}
                  onClick={() => navigate(`/menu/item/${item.id}`)}
                >{item.name}</h3>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>
                    {Number(item.price).toLocaleString('vi-VN')}₫
                  </span>
                  <div className={styles.qtyArea}>
                    {getCartQty(item.id) > 0 && (
                      <span className={styles.inCart}>×{getCartQty(item.id)}</span>
                    )}
                    <button
                      className={`${styles.addBtn} ${added[item.id] ? styles.addedAnim : ''}`}
                      onClick={() => handleAdd(item)}
                    >
                      {added[item.id] ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
