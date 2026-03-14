import { createContext, useContext, useState } from 'react'

const T = {
  vi: {
    welcome: 'Chào mừng',
    selectLang: 'Chọn ngôn ngữ',
    menu: 'Thực đơn',
    order: 'Đơn hàng',
    feedback: 'Đánh giá',
    support: 'Hỗ trợ',
    table: 'Bàn',
    search: 'Tìm món...',
    searchById: 'Tìm theo ID...',
    allCategories: 'Tất cả',
    addToOrder: 'Thêm',
    viewOrder: 'Xem đơn',
    confirmOrder: 'Xác nhận đặt món',
    cancel: 'Huỷ',
    confirm: 'Xác nhận',
    note: 'Ghi chú cho bếp...',
    total: 'Tổng cộng',
    pending: 'Chờ xác nhận',
    preparing: 'Đang làm',
    completed: 'Hoàn thành',
    noOrders: 'Chưa có đơn nào',
    sendFeedback: 'Gửi đánh giá',
    yourComment: 'Nhận xét của bạn...',
    send: 'Gửi',
    qty: 'Số lượng',
    unitPrice: 'Đơn giá',
    subtotal: 'Thành tiền',
    orderConfirmed: 'Đã đặt món!',
    newOrder: 'Đặt thêm',
    typeMessage: 'Nhắn tin cho nhân viên...',
    payAtCounter: 'Thanh toán tại quầy',
    version: 'Phiên bản'
  },
  en: {
    welcome: 'Welcome',
    selectLang: 'Select Language',
    menu: 'Menu',
    order: 'Orders',
    feedback: 'Feedback',
    support: 'Support',
    table: 'Table',
    search: 'Search dishes...',
    searchById: 'Search by ID...',
    allCategories: 'All',
    addToOrder: 'Add',
    viewOrder: 'View Order',
    confirmOrder: 'Confirm Order',
    cancel: 'Cancel',
    confirm: 'Confirm',
    note: 'Note for kitchen...',
    total: 'Total',
    pending: 'Pending',
    preparing: 'Preparing',
    completed: 'Completed',
    noOrders: 'No orders yet',
    sendFeedback: 'Send Feedback',
    yourComment: 'Your comment...',
    send: 'Send',
    qty: 'Qty',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',
    orderConfirmed: 'Order placed!',
    newOrder: 'New Order',
    typeMessage: 'Message staff...',
    payAtCounter: 'Pay at counter',
    version: 'Version'
  }
}

const LangContext = createContext()
export const useLang = () => useContext(LangContext)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('vi')
  const t = T[lang]
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}
