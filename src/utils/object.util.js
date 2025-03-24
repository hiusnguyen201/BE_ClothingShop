export const uniqueProductVariants = (arr) => {
    let newArr = [];
    let uniqueVariantValues = new Set();
    arr = arr.map(variant => ({
        ...variant,
        variant_values: variant.variant_values.map(item => sortObject(item))
    }))

    arr.map((variant, i) => {
        const variantKey = JSON.stringify(variant.variant_values)
        if (!uniqueVariantValues.has(variantKey)) {
            uniqueVariantValues.add(variantKey)
            newArr.push(arr[i])
        }
    })

    return Array.from(newArr);
}

function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

export const isVariantValuesDuplicated = (currentArr, newVariantValues) => {
    newVariantValues = newVariantValues.map(value => sortObject(value));

    for (const item of currentArr) {
        const currentValues = item.variant_values.map((v) => {
            return {
                option: v.option,
                option_value: v.option_value
            }
        });

        if (JSON.stringify(currentValues) === JSON.stringify(newVariantValues)) {
            return true;
        }
    }
    return false;
}