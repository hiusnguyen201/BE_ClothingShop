import axios from 'axios';
import moment from 'moment-timezone';

const ghnAPI = axios.create({
  baseURL: process.env.GHN_API_URL,
  headers: {
    Token: process.env.GHN_TOKEN,
    ShopId: process.env.GHN_SHOP_ID,
    'Content-Type': 'application/json',
  },
});

// Tính Phí giao hàng
export const getCalculateShippingFee = async (
  fromDistrictId,
  toDistrictId,
  fromWardCode,
  toWardCode,
  weight,
  length,
  width,
  height,
) => {
  const response = await ghnAPI.post('/v2/shipping-order/fee', {
    service_type_id: 2,
    from_district_id: 1442,
    from_ward_code: '21211',
    to_district_id: 1820,
    to_ward_code: '030712',
    length: 10,
    width: 20,
    height: 15,
    weight: 10,
    insurance_value: 0,
    coupon: null,
    items: [
      {
        name: 'TEST1',
        quantity: 1,
        length: 200,
        width: 200,
        height: 200,
        weight: 1000,
      },
    ],
  });
  return response.data.data;
};

// Tạo đơn hàng GHN
export const createGHNOrder = async (order, user, userAddress, calculateOrderDetails) => {
  const pickupTime = moment().unix();
  const response = await ghnAPI.post(`/v2/shipping-order/create`, {
    payment_type_id: 1,
    note: '',
    required_note: 'KHONGCHOXEMHANG',
    return_phone: userAddress.customerPhone,
    return_address: userAddress.address,
    return_district_id: null,
    return_ward_code: '',
    client_order_code: order.code,
    from_name: userAddress.customerName,
    from_phone: userAddress.customerPhone,
    from_address: userAddress.address,
    from_ward_name: userAddress.ward,
    from_district_name: userAddress.district,
    from_province_name: userAddress.province,
    to_name: order.customerName,
    to_phone: order.customerPhone,
    to_address: order.address,
    to_ward_name: order.wardName,
    to_district_name: order.districtName,
    to_province_name: order.provinceName,
    cod_amount: order.total,
    content: '',
    length: 12,
    width: 12,
    height: 12,
    weight: 1200,
    cod_failed_amount: 2000,
    pick_station_id: 1444,
    deliver_station_id: null,
    insurance_value: order.total,
    service_type_id: 2,
    coupon: null,
    pickup_time: pickupTime,
    pick_shift: [2],
    items: calculateOrderDetails.processedVariants.map((item) => ({
      name: item.name,
      code: item.sku,
      quantity: item.quantity,
      price: item.price,
      length: 12,
      width: 12,
      height: 12,
      weight: 1000,
    })),
  });
  return response.data;
};

// Lấy danh sách tỉnh/thành phố
export const getProvinces = async () => {
  const response = await ghnAPI.get('/master-data/province');
  return response.data.data;
};

// Lấy danh sách quận/huyện theo tỉnh
export const getDistricts = async (provinceId) => {
  const response = await ghnAPI.get('/master-data/district', { params: { province_id: provinceId } });
  return response.data.data;
};

// Lấy danh sách phường/xã theo quận
export const getWards = async (districtId) => {
  const response = await ghnAPI.get('/master-data/ward', { params: { district_id: districtId } });
  return response.data.data;
};
