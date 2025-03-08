import express from 'express';

import { validateSchema } from '#src/middlewares/validate-request.middleware';
import { createProductController } from '#src/app/v1/producuts/products.controller';

const router = express.Router();

router.post('/create-product', createProductController);

export default router;
