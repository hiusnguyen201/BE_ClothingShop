export const calculatePagination = (page, limit, totalCount) => {
  const totalPage = Math.ceil(totalCount / limit);

  if (page <= 0 || !page) {
    page = 1;
  } else if (page > totalPage && totalPage >= 1) {
    page = totalPage;
  }

  return {
    page: +page,
    limit: +limit,
    totalCount: +totalCount,
    offset: (page - 1) * limit,
    totalPage: +totalPage,
    isNext: page < totalPage,
    isPrevious: page > 1,
    isFirst: page > 1 && page <= totalPage,
    isLast: page >= 1 && page < totalPage,
  };
};
