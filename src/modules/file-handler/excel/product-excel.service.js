import ExcelJS from 'exceljs';

/**
 * Generate Excel buffer for products export
 * @param {Array} data List of products to export
 * @returns {Promise<{buffer: Buffer, fileName: string}>} Excel file buffer and name
 */
export async function generateProductExcelBufferService(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 30 },
    { header: 'Thumbnail', key: 'thumbnail', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Subcategory', key: 'subCategory', width: 20 },
    { header: 'Price', key: 'price', width: 20 },
    { header: 'Stock', key: 'stock', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  data.forEach((product) => {
    const prices = product.productVariants.map((v) => v.price);
    return worksheet.addRow({
      ...product,
      _id: String(product._id),
      category: product?.category?.name || '',
      subCategory: product?.subCategory?.name || '',
      price: `${Math.min(...prices)}đ ~ ${Math.max(...prices)}đ`,
      stock: product.productVariants.reduce((sum, v) => {
        sum += v.quantity;
        return sum;
      }, 0),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: 'products-list.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
