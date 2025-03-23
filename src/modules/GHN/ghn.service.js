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
// create order GHN
export const createGhnOrder = async (order, orderDetails) => {
  const pickupTime = moment().unix();
  const response = await ghnAPI.post(`/v2/shipping-order/create`, {
    payment_type_id: 1,
    note: '',
    required_note: 'KHONGCHOXEMHANG',
    return_phone: '0398779258',
    return_address: 'so 10 ngo 47 mai dich cau giay ha noi',
    return_district_id: null,
    return_ward_code: '',
    client_order_code: order.code,
    from_name: 'vuong',
    from_phone: '0398779258',
    from_address: 'so 10 ngo 47 mai dich cau giay ha noi',
    from_ward_name: 'mai dich',
    from_district_name: 'cau giay',
    from_province_name: 'ha noi',
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
    items: orderDetails.map((item) => ({
      name: item.variantId.sku,
      code: item.productId,
      quantity: item.quantity,
      price: item.unitPrice,
      length: 12,
      width: 12,
      height: 12,
      weight: 1000,
    })),
  });
  return response.data;
};

// get details by client_oder_code
export const getOrderGhnByClientOrderCode = async (clientOrderCode) => {
  const response = await ghnAPI.post('/v2/shipping-order/detail-by-client-code', {
    client_order_code: clientOrderCode,
  });
  return response.data.data;
};

// remove order GHN
export const removeOrderGhn = async (orderCode) => {
  const response = await ghnAPI.post('/v2/switch-status/cancel', { order_codes: [orderCode] });
  return response.data.data;
};

// get provinces
export const getProvinces = async () => {
  const response = await ghnAPI.get('/master-data/province');
  return response.data.data;
};

// get districts
export const getDistricts = async (provinceId) => {
  const response = await ghnAPI.get('/master-data/district', { params: { province_id: provinceId } });
  return response.data.data;
};

// get wards
export const getWards = async (districtId) => {
  const response = await ghnAPI.get('/master-data/ward', { params: { district_id: districtId } });
  return response.data.data;
};
