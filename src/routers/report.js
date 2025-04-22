import express from 'express';
const router = express.Router();
import {
  getTodayCustomerReportController,
  getTodayOrderReportController,
  getTodayRevenueReportController,
  getTodaySalesController,
  getTopProductVariantsController,
} from '#src/app/report/report.controller';

router.get('/customers/today', getTodayCustomerReportController);
router.get('/orders/today', getTodayOrderReportController);
router.get('/revenue/today', getTodayRevenueReportController);
router.get('/products/top-sale', getTopProductVariantsController);
router.get('/sales/today', getTodaySalesController);

export default router;
