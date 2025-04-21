import { PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import axios from 'axios';
const ghnAPI = axios.create({
  baseURL: process.env.GHN_BASE_URL,
  headers: {
    Token: process.env.GHN_TOKEN,
    // ShopId: process.env.GHN_SHOP_ID,
    'Content-Type': 'application/json',
  },
});

/**
 * Create Order GHN
 * https://api.ghn.vn/home/docs/detail?id=123
 * @param {*} order
 * @returns
 */
export const createGHNOrderService = async (order) => {
  const isPaid = order.payment.status === PAYMENT_STATUS.PAID;

  const payload = {
    from_name: 'VTC Academy',
    from_phone: '0383460015',
    from_address: '18 Tam Trinh, Mai Động, Quận Hai Bà Trưng, Hà Nội, Vietnam',
    from_ward_name: 'Phường Trương Định',
    from_district_name: 'Quận Hai Bà Trưng',
    from_province_name: 'Hà Nội',

    to_name: order.customerName,
    to_phone: order.customerPhone,
    to_address: order.address,
    to_district_name: order.districtName,
    to_province_name: order.provinceName,
    to_ward_name: order.wardName,

    client_order_code: order._id,

    cod_amount: isPaid ? 0 : order.total,

    weight: order.orderDetails.length * 200,
    length: 12,
    width: 12,
    height: 12,

    pick_station_id: 1444, //

    insurance_value: order.total,
    coupon: null,

    service_type_id: 2,
    payment_type_id: 1,

    note: '',
    required_note: 'KHONGCHOXEMHANG',

    items: order.orderDetails.map((item) => ({
      name: item.product.name,
      code: item.variant.sku,
      quantity: item.quantity,
      price: item.unitPrice,
    })),
  };

  try {
    const response = await ghnAPI.post(`/v2/shipping-order/create`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating GHN order:', error.response.data);
  }
};

/**
 * Cancel Order GHN
 * https://api.ghn.vn/home/docs/detail?id=102
 * @param {*} order
 * @returns
 */
export const cancelGHNOrderService = async (trackingNumber) => {
  const payload = {
    order_codes: [trackingNumber],
  };

  try {
    const response = await ghnAPI.post(`/v2/switch-status/cancel`, payload);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error Cancel GHN order:', error.response.data);
  }
};

// get tracking details by trackingNumber
export const getTrackingDetailsService = async (trackingNumber) => {
  const response = await ghnAPI.post('/v2/shipping-order/detail', {
    order_code: trackingNumber,
  });
  return response.data.data?.log || [];
};

// get provinces
export const getAllProvincesService = async () => {
  const response = await ghnAPI.get('/master-data/province');
  return response.data.data;
};

// get districts
export const getDistrictsByProvinceIdService = async (provinceId) => {
  const response = await ghnAPI.get('/master-data/district', { params: { province_id: provinceId } });
  return response.data.data;
};

// get wards
export const getWardsByDistrictIdService = async (districtId) => {
  const response = await ghnAPI.get('/master-data/ward', { params: { district_id: districtId } });
  return response.data.data;
};

export const getProvinceService = async (provinceId) => {
  const response = await ghnAPI.get('/master-data/province');
  return response.data.data.find((item) => item.ProvinceID === provinceId);
};

export const getDistrictService = async (districtId, provinceId) => {
  const response = await ghnAPI.get('/master-data/district', { params: { province_id: provinceId } });
  return response.data.data.find((item) => item.DistrictID === districtId);
};

export const getWardService = async (wardId, districtId) => {
  const response = await ghnAPI.get('/master-data/ward', { params: { district_id: districtId } });
  return response.data.data.find((item) => item.WardCode === wardId);
};
