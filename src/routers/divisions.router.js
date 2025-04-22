import express from 'express';
const router = express.Router();

import {
  checkValidAddressController,
  getAllDistrictsByProvinceCodeController,
  getAllProvincesController,
  getAllWardsByDistrictCodeController,
} from '#src/app/divisions/divisions.controller';

router.get('/get-provinces', getAllProvincesController);
router.get('/get-districts-by-province-code/:provinceCode', getAllDistrictsByProvinceCodeController);
router.get('/get-wards-by-district-code/:districtCode', getAllWardsByDistrictCodeController);
router.post('/check-valid-address', checkValidAddressController);

export default router;
