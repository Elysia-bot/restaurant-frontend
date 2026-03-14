import { useState, useEffect } from 'react'
import { statsAPI, orderAPI } from '../../services/api'
import styles from './StatsPage.module.css'

export default function StatsPage() {
  const [revenue, setRevenue]   = useState(null)
  const [topItems, setTopItems] = useState([])
  const [from, setFrom]         = useState(new Date().toISOString().slice(0,10))
  const [to, setTo]             = useState(new Date().toISOString().slice(0,10))

  const load = () => {
    statsAPI.getRevenue({ from, to }).then(r => setRevenue(r.data))
    statsAPI.getTopItems().then(r => setTopItems(r.data.slice(0, 10)))
  }

  useEffect(() => { load() }, [])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>📊 Thống kê doanh thu</h1>

      {/* Date filter */}
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.filterField}>
            <label>Từ ngày</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className={styles.filterField}>
            <label>Đến ngày</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className={styles.searchBtn} onClick={load}>Xem →</button>
        </div>
      </div>

      {/* KPI cards */}
      {revenue && (
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard} style={{ borderTopColor: '#2563EB' }}>
            <div className={styles.kpiLabel}>Doanh thu</div>
            <div className={styles.kpiValue}>{Number(revenue.totalRevenue).toLocaleString('vi-VN')}₫</div>
          </div>
          <div className={styles.kpiCard} style={{ borderTopColor: '#16A34A' }}>
            <div className={styles.kpiLabel}>Đơn hoàn thành</div>
            <div className={styles.kpiValue}>{revenue.totalOrders}</div>
          </div>
          <div className={styles.kpiCard} style={{ borderTopColor: '#D97706' }}>
            <div className={styles.kpiLabel}>Trung bình / đơn</div>
            <div className={styles.kpiValue}>
              {revenue.totalOrders > 0
                ? Math.round(revenue.totalRevenue / revenue.totalOrders).toLocaleString('vi-VN') + '₫'
                : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Top items */}
      <div className={styles.topCard}>
        <h2 className={styles.subTitle}>🏆 Món bán chạy nhất</h2>
        {topItems.length === 0 ? (
          <p className={styles.empty}>Chưa có dữ liệu</p>
        ) : (
          <div className={styles.topList}>
            {topItems.map((item, i) => (
              <div key={item.menuItemId} className={styles.topRow}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.topName}>{item.menuItemName}</span>
                <div className={styles.barWrap}>
                  <div
                    className={styles.bar}
                    style={{ width: `${(item.totalSold / topItems[0].totalSold) * 100}%` }}
                  />
                </div>
                <span className={styles.topSold}>{item.totalSold} phần</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
