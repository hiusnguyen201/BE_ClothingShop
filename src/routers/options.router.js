import express from 'express';
const router = express.Router();

import { getListOptionsController } from '#src/app/options/options.controller';

router.get('/', getListOptionsController);

export default router;
