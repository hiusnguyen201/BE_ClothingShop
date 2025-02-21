import express from 'express';
const router = express.Router();
import { validateSchema } from '#middlewares/validate-request.middleware';
import { claimVoucherByCodeController, getAllVoucherFromCustomerController } from '#app/account/account.controller';

import { claimVoucherByCodeDto } from '#app/account/dto/claim-voucher-by-code.dto';
import { isAuthorized } from '#middlewares/jwt-auth.middleware';

router.use([isAuthorized]);
router
  .post('/claim-voucher-by-code', validateSchema(claimVoucherByCodeDto), claimVoucherByCodeController)
  .get('/get-vouchers-from-customer', getAllVoucherFromCustomerController);

export default router;

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Account management
 */

/**
 * @swagger
 * /account/claim-voucher-by-code:
 *   post:
 *     summary: Claim a voucher by code
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/ClaimVoucherByCodeDto'
 *     responses:
 *       200:
 *         description: Voucher claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /account/get-vouchers-from-customer:
 *   get:
 *     summary: Get all vouchers from customer
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: List of vouchers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
