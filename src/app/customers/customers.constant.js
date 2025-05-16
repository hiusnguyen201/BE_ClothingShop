export const CUSTOMER_SELECTED_FIELDS = {
  _id: true,
  type: true,
  avatar: true,
  name: true,
  email: true,
  phone: true,
  gender: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

export const CUSTOMER_CACHE_KEY_PREFIX = {
  PROFILE: 'customer:profile',
  LIST_CUSTOMER: 'customer:list',
};

export const CUSTOMER_SEARCH_FIELDS = ['name', 'email', 'phone'];

export const CUSTOMER_SORT_KEYS = ['createdAt', 'name', 'email', 'lastLoginAt', 'gender', 'verifiedAt'];
