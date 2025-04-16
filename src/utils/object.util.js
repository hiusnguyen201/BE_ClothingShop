export const makeUniqueProductVariants = (arr) => {
  let newArr = [];
  let uniqueVariantValues = new Set();
  arr = arr.map((variant) => ({
    ...variant,
    variantValues: variant.variantValues.map((item) => sortObject(item)),
  }));

  arr.map((variant, i) => {
    const variantKey = JSON.stringify(variant.variantValues);
    if (!uniqueVariantValues.has(variantKey)) {
      uniqueVariantValues.add(variantKey);
      newArr.push(arr[i]);
    }
  });

  return Array.from(newArr);
};

function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}
