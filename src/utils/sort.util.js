export const getSortObject = (sortBy, sortOrder) => {
  sortBy = sortBy ? sortBy.split(',') : [];
  sortOrder = sortOrder ? sortOrder.split(',') : [];

  let sorts = { createdAt: 'desc' };
  if (Array.isArray(sortBy)) {
    sorts = sortBy.reduce((acc, curr, i) => {
      acc[curr] = sortOrder[i] || 'desc';
      return acc;
    }, {});
  }

  return sorts;
};
