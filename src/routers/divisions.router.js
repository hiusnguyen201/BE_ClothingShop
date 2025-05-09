import express from 'express';
const router = express.Router();

import {
  checkValidAddressController,
  getAllDistrictsByProvinceIdController,
  getAllProvincesController,
  getAllWardsByDistrictIdController,
} from '#src/app/divisions/divisions.controller';

router.get('/get-provinces', getAllProvincesController);
router.get('/get-districts-by-province-code/:provinceId', getAllDistrictsByProvinceIdController);
router.get('/get-wards-by-district-code/:districtId', getAllWardsByDistrictIdController);
router.post('/check-valid-address', checkValidAddressController);

export default router;
