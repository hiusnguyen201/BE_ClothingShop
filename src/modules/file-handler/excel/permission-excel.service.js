import ExcelJS from 'exceljs';

/**
 * Generate Excel buffer for permissions export
 * @param {Array} data List of permissions to export
 * @returns {Promise<{buffer: Buffer, fileName: string}>} Excel file buffer and name
 */
export async function generatePermissionExcelBufferService(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Permissions');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Description', key: 'description', width: 100 },
  ];

  data.forEach((permission) => worksheet.addRow({ ...permission, _id: String(permission._id) }));

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: 'permissions-list.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
