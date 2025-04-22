/** @type {import('#src/app/categories/models/category.model')} */

import { newCategoryService } from '#src/app/categories/categories.service';
import { faker } from '@faker-js/faker';

const CATEGORIES_DATA = [
  {
    name: "Men's Tops",
    image: faker.image.urlPicsumPhotos(),
    level: 1,
    subcategories: [
      { name: 'Tank Tops', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'T-Shirts', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Sports Shirts', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Polo Shirts', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Dress Shirts', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Long Sleeve Shirts', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Jackets', level: 2, image: faker.image.urlPicsumPhotos() },
    ],
  },
  {
    name: "Men's Pants",
    image: faker.image.urlPicsumPhotos(),
    level: 1,
    subcategories: [
      { name: 'Shorts', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Joggers', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Sports Pants', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Long Pants', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Jeans', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Swim Trunks', level: 2, image: faker.image.urlPicsumPhotos() },
    ],
  },
  {
    name: "Men's Underwear",
    image: faker.image.urlPicsumPhotos(),
    level: 1,
    subcategories: [
      { name: 'Briefs (Triangle)', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Trunks (Boxer)', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Boxer Briefs (Long Boxer)', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Long Leg Underwear', level: 2, image: faker.image.urlPicsumPhotos() },
      { name: 'Lounge Shorts', level: 2, image: faker.image.urlPicsumPhotos() },
    ],
  },
  {
    name: 'Accessories',
    image: faker.image.urlPicsumPhotos(),
    level: 1,
    subcategories: [{ name: 'All Accessories', level: 2, image: faker.image.urlPicsumPhotos() }],
  },
];

const categories = [];
CATEGORIES_DATA.map((parent) => {
  const newParent = newCategoryService(parent);
  categories.push(newParent);
  parent.subcategories.map((child) => {
    const newChild = newCategoryService({ ...child, parent: newParent._id });
    categories.push(newChild);
  });
});

export { categories };
