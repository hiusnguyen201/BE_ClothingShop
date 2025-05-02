export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  READY_TO_PICK: 'ready to pick',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_SELECTED_FIELDS = {
  _id: true,
  code: true,
  orderDate: true,
  provinceName: true,
  districtName: true,
  wardName: true,
  address: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  quantity: true,
  subTotal: true,
  shippingFee: true,
  trackingNumber: true,
  estimatedDeliveryAt: true,
  total: true,
  customer: true,
  payment: true,
  orderStatusHistory: true,
  orderDetails: true,
  createdAt: true,
  updatedAt: true,
};

export const ORDER_NOTIFICATION_KEY = {
  NEW_ORDER: 'new_order',
};

export const LOW_STOCK_WARNING_LEVEL = 5;
