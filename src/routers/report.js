import express from 'express';
const router = express.Router();
import {
  getCustomerReportController,
  getOrderReportController,
  getRevenueReportController,
  getTopProductVariantsController,
  getSalesReportController,
  getRecentOrdersController,
} from '#src/app/report/report.controller';

router.get('/customers', getCustomerReportController);
router.get('/orders', getOrderReportController);
router.get('/orders/recent', getRecentOrdersController);
router.get('/revenue', getRevenueReportController);
router.get('/products/top-sale', getTopProductVariantsController);
router.get('/sales', getSalesReportController);

export default router;
