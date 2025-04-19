import fetch from 'node-fetch';
import pkg from 'vietnam-provinces';
const { provinces, districts, wards } = pkg;

const provincesMap = new Map(provinces.map((item) => [item.code, item]));
const districtsMap = new Map(districts.map((item) => [item.code, item]));
const wardsMap = new Map(wards.map((item) => [item.code, item]));

const districtsGroupedByProvinceCode = new Map();
districts.forEach((district) => {
  if (!districtsGroupedByProvinceCode.has(district.province_code)) {
    districtsGroupedByProvinceCode.set(district.province_code, []);
  }
  districtsGroupedByProvinceCode.get(district.province_code).push(district);
});

const wardsGroupedByDistrictCode = new Map();
wards.forEach((ward) => {
  if (!wardsGroupedByDistrictCode.has(ward.district_code)) {
    wardsGroupedByDistrictCode.set(ward.district_code, []);
  }
  wardsGroupedByDistrictCode.get(ward.district_code).push(ward);
});

export const getAllProvincesService = () => provinces;

export const getAllDistrictsByProvinceCodeService = (provinceCode) =>
  districtsGroupedByProvinceCode.get(provinceCode) || [];
export const getAllWardsByDistrictCodeService = (districtCode) => wardsGroupedByDistrictCode.get(districtCode) || [];

export const getProvinceByCodeService = (code) => provincesMap.get(code);
export const getDistrictByCodeService = (code) => districtsMap.get(code);
export const getWardByCodeService = (code) => wardsMap.get(code);

export const checkValidAddressService = async (address, wardName, districtName, provinceName) => {
  const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(fullAddress)}&apiKey=${
      process.env.GEOAPIFY_KEY
    }&filter=countrycode:vn`,
    {
      method: 'GET',
    },
  );

  const result = await response.json();

  if (!result.features || result.features.length === 0) {
    return false;
  }

  const feature = result.features[0];

  const requiredFields = [
    feature.properties.city,
    feature.properties.street,
    feature.properties.postcode,
    feature.properties.housenumber,
  ];

  const missingData = requiredFields.filter((f) => !f);

  if (missingData.length > 2) {
    return false;
  }

  return true;
};
