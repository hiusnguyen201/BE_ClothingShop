export const PAYMENT_SELECTED_FIELDS = {
  _id: true,
  paymentUrl: true,
  paymentMethod: true,
  amountPaid: true,
  paidDate: true,
  transactionId: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
};

export const PAYMENT_TYPE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
};

export const ONLINE_PAYMENT_METHOD = {
  COD: 'cash on delivery',
  MOMO: 'momo',
};

export const OFFLINE_PAYMENT_METHOD = {
  CASH: 'cash',
  BANKING: 'banking',
};
