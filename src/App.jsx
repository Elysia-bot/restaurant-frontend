import { Routes, Route, Navigate } from 'react-router-dom'
import LanguagePicker from './pages/guest/LanguagePicker'
import GuestLayout    from './pages/guest/GuestLayout'
import MenuPage       from './pages/guest/MenuPage'
import OrdersPage     from './pages/guest/OrdersPage'
import FeedbackPage   from './pages/guest/FeedbackPage'
import ItemDetail     from './pages/guest/ItemDetail'
import AdminLogin     from './pages/admin/AdminLogin'
import AdminLayout    from './pages/admin/AdminLayout'
import OrderBoard     from './pages/admin/OrderBoard'
import MenuManage     from './pages/admin/MenuManage'
import StatsPage      from './pages/admin/StatsPage'
import FeedbackAdmin  from './pages/admin/FeedbackAdmin'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('adminToken')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route path="/scan"     element={<LanguagePicker />} />
      <Route path="/menu"     element={<GuestLayout />}>
        <Route index          element={<MenuPage />} />
        <Route path="item/:id"element={<ItemDetail />} />
        <Route path="orders"  element={<OrdersPage />} />
        <Route path="feedback"element={<FeedbackPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index           element={<OrderBoard />} />
        <Route path="menu"     element={<MenuManage />} />
        <Route path="stats"    element={<StatsPage />} />
        <Route path="feedback" element={<FeedbackAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/scan?qr=TABLE_1" replace />} />
    </Routes>
  )
}
