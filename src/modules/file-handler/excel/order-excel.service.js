import ExcelJS from 'exceljs';

/**
 * Generate Excel buffer for orders export
 * @param {Array} data List of orders to export
 * @returns {Promise<{buffer: Buffer, fileName: string}>} Excel file buffer and name
 */
export async function generateOrderExcelBufferService(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 30 },
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Order Date', key: 'orderDate', width: 10 },
    { header: 'Province', key: 'provinceName', width: 20 },
    { header: 'District', key: 'districtName', width: 20 },
    { header: 'Ward', key: 'wardName', width: 20 },
    { header: 'Address', key: 'address', width: 80 },
    { header: 'Customer Name', key: 'customerName', width: 30 },
    { header: 'Customer Email', key: 'customerEmail', width: 30 },
    { header: 'Customer Phone', key: 'customerPhone', width: 30 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Total', key: 'total', width: 10 },
    { header: 'Status', key: 'orderStatusHistory[0].status', width: 10 },
  ];

  data.forEach((order) =>
    worksheet.addRow({
      ...order,
      _id: String(order._id),
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
    }),
  );

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: 'orders-list.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
