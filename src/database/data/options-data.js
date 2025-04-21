/** @type {import('#src/app/options/models/option.model')} */
/** @type {import('#src/app/options/models/option-value.model')} */

import { newOptionService, newOptionValueService } from '#src/app/options/options.service';

const colors = [
  'Red',
  'Green',
  'Blue',
  'Yellow',
  'Orange',
  'Purple',
  'Pink',
  'Brown',
  'Black',
  'White',
  'Gray',
  'Cyan',
  'Lime',
];
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

export const colorValuesInstance = colors.map((item) => {
  const newValue = newOptionValueService({ valueName: item });
  return newValue.toObject();
});

export const sizeValuesInstance = sizes.map((item) => {
  const newValue = newOptionValueService({ valueName: item });
  return newValue.toObject();
});

const OPTIONS_DATA = [
  {
    name: 'Color',
    optionValues: colorValuesInstance.map((item) => item._id),
  },
  {
    name: 'Size',
    optionValues: sizeValuesInstance.map((item) => item._id),
  },
];

const optionValues = [...colorValuesInstance, ...sizeValuesInstance];
const options = OPTIONS_DATA.map((opt) => {
  const newOption = newOptionService(opt);
  return newOption.toObject();
});

export { optionValues, options };
