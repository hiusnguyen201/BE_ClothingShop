export const USER_TYPE = {
  CUSTOMER: 'customer',
  USER: 'user',
};

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

export const USER_SELECTED_FIELDS = {
  _id: true,
  type: true,
  avatar: true,
  name: true,
  email: true,
  phone: true,
  gender: true,
  role: true,
  verifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

export const USER_CACHE_KEY_PREFIX = {
  PROFILE: 'user:profile',
  LIST_USER: 'user:list',
};

export const USER_SEARCH_FIELDS = ['name', 'email', 'phone'];

export const USER_SORT_KEYS = ['createdAt', 'name', 'email', 'lastLoginAt', 'gender', 'verifiedAt'];

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};
