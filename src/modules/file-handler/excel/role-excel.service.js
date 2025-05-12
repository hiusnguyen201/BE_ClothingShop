import ExcelJS from 'exceljs';

/**
 * Generate Excel buffer for roles export
 * @param {Array} data List of roles to export
 * @returns {Promise<{buffer: Buffer, fileName: string}>} Excel file buffer and name
 */
export async function generateRoleExcelBufferService(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Roles');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Description', key: 'description', width: 100 },
  ];

  data.forEach((role) => worksheet.addRow({ ...role, _id: String(role._id) }));

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: 'roles-list.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
