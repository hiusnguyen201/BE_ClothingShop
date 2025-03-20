import { HttpException } from '#src/core/exception/http-exception';
import { getDistricts, getProvinces, getWards } from '#src/modules/GHN/ghn.service';
import { getUserByIdService } from '#src/app/users/users.service';
import HttpStatus from 'http-status-codes';
import {
  createShippingAddressService,
  getShippingAddressByUserIdService,
  updateShippingAddressByIdService,
} from '#src/app/shipping-address/shipping-address.service';
import { Code } from '#src/core/code/Code';
export const createShippingAddressController = async (req, res) => {
  const { customerName, customerPhone, address, province, district, ward, isDefault } = req.body;

  const customerExisted = await getUserByIdService(req.user.id);

  // Lấy danh sách tỉnh/thành từ GHN
  const provinces = await getProvinces();
  const provinceData = provinces.find((p) =>
    p.NameExtension.some((name) => name.toLowerCase() === province.toLowerCase()),
  );
  if (!provinceData) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  // Lấy danh sách quận/huyện theo tỉnh
  const districts = await getDistricts(provinceData.ProvinceID);
  const districtData = districts.find((p) =>
    p.NameExtension.some((name) => name.toLowerCase() === district.toLowerCase()),
  );
  if (!districtData) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  // Lấy danh sách phường/xã theo huyện
  const wards = await getWards(districtData.DistrictID);
  const wardData = wards.find((p) => p.NameExtension.some((name) => name.toLowerCase() === ward.toLowerCase()));
  if (!wardData) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' });
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
