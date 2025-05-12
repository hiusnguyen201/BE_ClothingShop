import ExcelJS from 'exceljs';

/**
 * Generate Excel buffer for categories export
 * @param {Array} data List of categories to export
 * @returns {Promise<{buffer: Buffer, fileName: string}>} Excel file buffer and name
 */
export async function generateCategoryExcelBufferService(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Categories');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Level', key: 'level', width: 10 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  data.forEach((category) => worksheet.addRow({ ...category, _id: String(category._id) }));

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: 'categories-list.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
