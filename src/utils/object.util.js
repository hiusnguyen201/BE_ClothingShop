export const uniqueProductVariants = (arr) => {
    let newArr = [];
    let uniqueVariantValues = new Set();
    arr = arr.map(variant => ({
        ...variant,
        variantValues: variant.variantValues.map(item => sortObject(item))
    }))

    arr.map((variant, i) => {
        const variantKey = JSON.stringify(variant.variantValues)
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
        const currentValues = item.variantValues.map((v) => {
            return {
                option: v.option,
                optionValue: v.optionValue
            }
        });

        if (JSON.stringify(currentValues) === JSON.stringify(newVariantValues)) {
            return true;
        }
    }
    return false;
}