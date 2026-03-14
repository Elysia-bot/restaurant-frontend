import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { tableAPI } from '../../services/api'
import styles from './LanguagePicker.module.css'

export default function LanguagePicker() {
  const { setLang } = useLang()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const qr = params.get('qr') || 'TABLE_1'

  useEffect(() => {
    // Scan QR to get tableId
    tableAPI.scan(qr).then(res => {
      localStorage.setItem('tableId', res.data.id)
      localStorage.setItem('tableNumber', res.data.tableNumber)
    }).catch(() => {
      localStorage.setItem('tableId', '1')
      localStorage.setItem('tableNumber', '1')
    })
  }, [qr])

  const choose = (lang) => {
    setLang(lang)
    navigate('/menu')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bg} />
      <div className={styles.content}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🍚</div>
          <h1 className={styles.brand}>Quán Cô Hoàn</h1>
          <p className={styles.tagline}>Hương vị gia đình · Home-style Flavours</p>
        </div>

        <div className={styles.card}>
          <p className={styles.prompt}>
            Chọn ngôn ngữ <span>/</span> Select language
          </p>
          <div className={styles.options}>
            <button className={styles.langBtn} onClick={() => choose('vi')}>
              <span className={styles.flag}>🇻🇳</span>
              <span className={styles.langName}>Tiếng Việt</span>
              <span className={styles.langSub}>Vietnamese</span>
            </button>
            <button className={styles.langBtn} onClick={() => choose('en')}>
              <span className={styles.flag}>🇬🇧</span>
              <span className={styles.langName}>English</span>
              <span className={styles.langSub}>Tiếng Anh</span>
            </button>
          </div>
        </div>

        <p className={styles.tableInfo}>
          Bàn / Table <strong>{qr.replace('TABLE_', '')}</strong>
        </p>
      </div>
    </div>
  )
}
