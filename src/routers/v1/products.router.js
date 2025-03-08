import express from 'express';

import { validateSchema } from '#src/core/validations/request.validation';
import { createProductController } from '#src/app/v1/products/products.controller';

const router = express.Router();

router.post('/create-product', createProductController);

export default router;
