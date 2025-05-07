import express from 'express';
const router = express.Router();

import {
  checkValidAddressController,
  getAllDistrictsByprovinceIdController,
  getAllProvincesController,
  getAllWardsBydistrictIdController,
} from '#src/app/divisions/divisions.controller';

router.get('/get-provinces', getAllProvincesController);
router.get('/get-districts-by-province-code/:provinceId', getAllDistrictsByprovinceIdController);
router.get('/get-wards-by-district-code/:districtId', getAllWardsBydistrictIdController);
router.post('/check-valid-address', checkValidAddressController);

export default router;
