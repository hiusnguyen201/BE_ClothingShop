import express from 'express';

import { validateBody } from '#src/core/validations/request.validation';
import { createProductController, createProductVariantController } from '#src/app/v1/products/products.controller';

const router = express.Router();

router.post('/create-product', createProductController);
router.post('/create-product-variant', createProductVariantController);

export default router;
