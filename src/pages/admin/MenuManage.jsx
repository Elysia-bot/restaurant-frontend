import { useState, useEffect } from 'react'
import { menuAPI, categoryAPI } from '../../services/api'
import styles from './MenuManage.module.css'

const EMPTY = { name: '', description: '', price: '', imageUrl: '', categoryId: '', isAvailable: true }

export default function MenuManage() {
  const [items, setItems]     = useState([])
  const [cats, setCats]       = useState([])
  const [selCat, setSelCat]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')

  const load = () => {
    menuAPI.getAll(selCat ? { categoryId: selCat } : {}).then(r => setItems(r.data))
    categoryAPI.getAll().then(r => setCats(r.data))
  }

  useEffect(() => { load() }, [selCat])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (item) => {
    setEditing(item.id)
    setForm({ name: item.name, description: item.description || '', price: item.price, imageUrl: item.imageUrl || '', categoryId: item.categoryId, isAvailable: item.isAvailable })
    setShowForm(true)
  }

  const handleSave = async () => {
    setLoading(true)
    const payload = { ...form, price: Number(form.price), categoryId: Number(form.categoryId) }
    if (editing) await menuAPI.update(editing, payload)
    else          await menuAPI.create(payload)
    setShowForm(false); load(); setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa món này?')) return
    await menuAPI.delete(id); load()
  }

  const handleToggle = async (id) => {
    await menuAPI.toggle(id); load()
  }

  const handleAddCat = async () => {
    if (!catName.trim()) return
    await categoryAPI.create({ name: catName, displayOrder: cats.length })
    setCatName(''); setShowCatForm(false); load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🍽️ Quản lý thực đơn</h1>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => setShowCatForm(true)}>+ Danh mục</button>
          <button className={styles.btnPrimary} onClick={openAdd}>+ Thêm món</button>
        </div>
      </div>

      {/* Category filter */}
      <div className={styles.catRow}>
        <button className={`${styles.catChip} ${!selCat ? styles.catActive : ''}`} onClick={() => setSelCat('')}>Tất cả</button>
        {cats.map(c => (
          <button key={c.id} className={`${styles.catChip} ${selCat == c.id ? styles.catActive : ''}`} onClick={() => setSelCat(c.id)}>{c.name}</button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Tên món</th><th>Danh mục</th><th>Giá</th><th>Hiển thị</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className={!item.isAvailable ? styles.rowDisabled : ''}>
                <td><span className={styles.idBadge}>#{item.id}</span></td>
                <td>
                  <div className={styles.itemCell}>
                    {item.imageUrl && <img src={item.imageUrl} alt="" className={styles.thumb} />}
                    <div>
                      <div className={styles.itemName}>{item.name}</div>
                      {item.description && <div className={styles.itemDesc}>{item.description.slice(0,50)}...</div>}
                    </div>
                  </div>
                </td>
                <td><span className={styles.catTag}>{item.categoryName}</span></td>
                <td className={styles.priceCell}>{Number(item.price).toLocaleString('vi-VN')}₫</td>
                <td>
                  <button
                    className={`${styles.toggleBtn} ${item.isAvailable ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => handleToggle(item.id)}
                  >
                    {item.isAvailable ? '● Có' : '○ Hết'}
                  </button>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEdit(item)}>✏️</button>
                    <button className={styles.delBtn} onClick={() => handleDelete(item.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editing ? 'Sửa món' : 'Thêm món mới'}</h3>
            {[
              ['name','Tên món *','text'],
              ['price','Giá (VND) *','number'],
              ['imageUrl','URL hình ảnh','text'],
              ['description','Mô tả','text'],
            ].map(([field, label, type]) => (
              <div key={field} className={styles.field}>
                <label>{label}</label>
                <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
              </div>
            ))}
            <div className={styles.field}>
              <label>Danh mục *</label>
              <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                <option value="">-- Chọn --</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))} />
                Hiển thị trên menu
              </label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>Huỷ</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>{loading ? '...' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category form */}
      {showCatForm && (
        <div className={styles.overlay} onClick={() => setShowCatForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Thêm danh mục</h3>
            <div className={styles.field}>
              <label>Tên danh mục</label>
              <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="VD: Cơm, Canh..." autoFocus />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowCatForm(false)}>Huỷ</button>
              <button className={styles.btnPrimary} onClick={handleAddCat}>Thêm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
