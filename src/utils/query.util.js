export const extendQueryOptionsWithPagination = (pagination, options = {}) => {
  const { page, limit } = pagination;

  if (page) {
    const offset = (page - 1) * limit;
    options.skip = offset;
  }
  if (limit) {
    options.limit = limit;
  }

  return options;
};

export const extendQueryOptionsWithSort = (sort, options = {}) => {
  const { sortBy, sortOrder } = sort;
  if (!sortBy || !sortOrder) return options;

  options.sort = { [sortBy]: sortOrder };

  return options;
};
