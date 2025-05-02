export const PRODUCT_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
};

export const PRODUCT_SELECT_FIELDS = {
  thumbnail: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  category: true,
  subCategory: true,
  productOptions: true,
  productVariants: true,
  createdAt: true,
  updatedAt: true,
};

export const PRODUCT_CACHE_KEY_PREFIX = {
  DETAILS: 'product:details',
  LIST_PRODUCT: 'product:list',
};

export const PRODUCT_SEARCH_FIELDS = ['name', 'email', 'phone'];
