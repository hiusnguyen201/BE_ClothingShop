import axios from 'axios';

export const checkValidAddressService = async (address) => {
  const response = await axios.get(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${
      process.env.GEOAPIFY_KEY
    }&filter=countrycode:vn`,
  );

  const result = await response.data;

  if (!result.features || result.features.length === 0) {
    return false;
  }

  const feature = result.features[0];

  const requiredFields = [feature.properties.city, feature.properties.street, feature.properties.postcode];

  const missingData = requiredFields.filter((f) => !f);

  if (missingData.length > 2) {
    return false;
  }

  return true;
};
