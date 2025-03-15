import { NotFoundException } from '#src/core/exception/http-exception';
import { getDistricts, getProvinces, getWards } from '#src/modules/GHN/ghn.service';
import { getUserByIdService } from '#src/app/v1/users/users.service';
import HttpStatus from 'http-status-codes';
import {
  createShippingAddressService,
  getShippingAddressByUserIdService,
  updateShippingAddressByIdService,
} from '#src/app/v1/shipping-address/shipping-address.service';

export const createShippingAddressController = async (req, res) => {
  const { customerName, customerPhone, address, province, district, ward, isDefault } = req.body;

  const customerExisted = await getUserByIdService(req.user._id);

  // Lấy danh sách tỉnh/thành từ GHN
  const provinces = await getProvinces();
  const provinceData = provinces.find((p) => p.ProvinceName === province);
  if (!provinceData) {
    throw new NotFoundException('Provinces not found');
  }

  // Lấy danh sách quận/huyện theo tỉnh
  const districts = await getDistricts(provinceData.ProvinceID);

  const districtData = districts.find((d) => d.DistrictName === district);
  if (!districtData) {
    throw new NotFoundException('districts not found');
  }

  // Lấy danh sách phường/xã theo huyện
  const wards = await getWards(districtData.DistrictID);
  const wardData = wards.find((w) => w.WardName === ward);
  if (!wardData) {
    throw new NotFoundException('wards not found');
  }

  const createShippingAddressRequirement = {
    customerId: customerExisted._id,
    customerName,
    customerPhone,
    address: `${address}, ${ward}, ${district}, ${province}`,
    province,
    district,
    ward,
    isDefault,
  };

  if (isDefault) {
    const addressUser = await getShippingAddressByUserIdService(customerExisted._id, isDefault);

    await updateShippingAddressByIdService(addressUser._id, {
      isDefault: false,
    });
  }

  const newShippingAddress = await createShippingAddressService(createShippingAddressRequirement);

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Create shipping address successfully',
    data: newShippingAddress,
  };
};
