export const NOTIFICATION_TYPE = {
  NEW_ORDER: 'new_order',
  NEW_CUSTOMER: 'new_customer',
  LOW_STOCK: 'low_stock',
  CONFIRM_ORDER: 'confirm_order',
  PROCESSING_ORDER: 'processing_order',
  READY_FOR_PICKUP_ORDER: 'ready_for_pickup_order',
  SHIPPING_ORDER: 'shipping_order',
  CANCEL_ORDER: 'cancel_order',
  COMPLETE_ORDER: 'complete_order',
};

export const NOTIFICATION_SELECTED_FIELDS = {
  _id: true,
  type: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
};

export const USER_NOTIFICATION_SELECTED_FIELDS = {
  _id: true,
  user: true,
  notification: true,
  isRead: true,
  readAt: true,
  deliveredAt: true,
  createdAt: true,
  updatedAt: true,
};

export const NOTIFICATION_CHANNEL = 'notification';
