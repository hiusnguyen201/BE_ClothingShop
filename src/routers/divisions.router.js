import express from 'express';
const router = express.Router();

import {
  checkValidAddressController,
  getAllDistrictsByProvinceCodeController,
  getAllProvincesController,
  getAllWardsByDistrictCodeController,
} from '#src/app/divisions/divisions.controller';
import { validateBody } from '#src/core/validations/request.validation';
import { CheckValidAddressDto } from '#src/app/divisions/dtos/check-valid-address.dto';

router.get('/get-provinces', getAllProvincesController);
router.get('/get-districts-by-province-code/:provinceCode', getAllDistrictsByProvinceCodeController);
router.get('/get-wards-by-district-code/:districtCode', getAllWardsByDistrictCodeController);
router.post('/check-valid-address', validateBody(CheckValidAddressDto), checkValidAddressController);

export default router;
