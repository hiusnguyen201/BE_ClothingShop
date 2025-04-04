export const extendQueryOptionsWithPagination = (skip, limit) => {
  const options = {};

  if (skip) {
    options.skip = skip;
  }
  if (limit) {
    options.limit = limit;
  }

  return options;
};

export const extendQueryOptionsWithSort = (sortBy, sortOrder) => {
  const options = {};
  if (!sortBy || !sortOrder) return options;

  options.sort = { [sortBy]: sortOrder };

  return options;
};
