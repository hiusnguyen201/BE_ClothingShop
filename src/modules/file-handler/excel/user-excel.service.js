import ExcelJS from 'exceljs';

/**
 * Generate Excel buffer for users export
 * @param {Array} data List of users to export
 * @returns {Promise<{buffer: Buffer, fileName: string}>} Excel file buffer and name
 */
export async function generateUserExcelBufferService(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Gender', key: 'gender', width: 15 },
    { header: 'Verified At', key: 'verifiedAt', width: 30 },
    { header: 'Last Login At', key: 'lastLoginAt', width: 30 },
  ];

  data.forEach((user) => worksheet.addRow({ ...user, _id: String(user._id), role: user?.role?.name || '' }));

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: 'users-list.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
