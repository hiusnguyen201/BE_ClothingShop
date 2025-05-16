/** @type {import('#src/app/options/models/option.model')} */
/** @type {import('#src/app/options/models/option-value.model')} */

import { newOptionRepository, newOptionValueRepository } from '#src/app/options/options.repository';
import { faker } from '@faker-js/faker';

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
  const newValue = newOptionValueRepository({
    valueName: item,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
  return newValue;
});

export const sizeValuesInstance = sizes.map((item) => {
  const newValue = newOptionValueRepository({
    valueName: item,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
  return newValue;
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
  const newOption = newOptionRepository({ ...opt, createdAt: faker.date.past(), updatedAt: faker.date.past() });
  return newOption;
});

export { optionValues, options };
