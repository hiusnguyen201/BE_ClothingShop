import ExcelJS from 'exceljs';

/**
 * Generate Excel buffer for customers export
 * @param {Array} data List of customers to export
 * @returns {Promise<{buffer: Buffer, fileName: string}>} Excel file buffer and name
 */
export async function generateCustomerExcelBufferService(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customers');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Gender', key: 'gender', width: 15 },
    { header: 'Verified At', key: 'verifiedAt', width: 30 },
    { header: 'Last Login At', key: 'lastLoginAt', width: 30 },
  ];

  data.forEach((customer) => worksheet.addRow({ ...customer, _id: String(customer._id) }));

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: 'customers-list.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
