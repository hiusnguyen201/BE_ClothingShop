/** @type {import('#src/app/users/models/user.model')} */

import { GENDER } from '#src/app/users/users.constant';
import { newUserRepository } from '#src/app/users/users.repository';
import { faker } from '@faker-js/faker';
import { rolePermissions, permissions } from '#src/database/data/permissions-data';
import { roles } from '#src/database/data/roles-data';
import { newCustomerRepository } from '#src/app/customers/customers.repository';

const VN_PHONE_PREFIXES = ['03', '05', '07', '08', '09'];

export const generateVietnamPhoneNumber = () => {
  const prefix = faker.helpers.arrayElement(VN_PHONE_PREFIXES);
  const suffix = faker.string.numeric(8); // 8-digit number
  return `${prefix}${suffix}`;
};

const USER_DATA = [
  {
    name: 'Access Control Manager',
    email: 'accessControl@gmail.com',
    password: '1234',
    phone: '0983460012',
    verifiedAt: new Date(),
    gender: GENDER.MALE,
    permissions: rolePermissions.map((p) => p._id),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  },
  {
    name: 'Admin',
    email: 'admin@gmail.com',
    password: '1234',
    phone: '0983460012',
    verifiedAt: new Date(),
    gender: GENDER.MALE,
    role: roles[0]._id,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  },
  {
    name: 'Test',
    email: 'test@gmail.com',
    password: '1234',
    phone: '0983460012',
    verifiedAt: new Date(),
    gender: GENDER.MALE,
    permissions: permissions.filter((p) => ['read', 'export'].some((item) => p.name.includes(item))).map((p) => p._id),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  },
  ...Array.from({ length: 50 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: generateVietnamPhoneNumber(),
    verifiedAt: Math.random() > 0.5 ? faker.date.past() : null,
    gender: faker.helpers.arrayElement(Object.values(GENDER)),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  })),
];

const CUSTOMER_DATA = [
  {
    name: 'Customer',
    email: 'customer1@gmail.com',
    password: '1234',
    phone: '0983460012',
    verifiedAt: new Date(),
    gender: GENDER.MALE,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  },
  {
    name: 'Customer',
    email: 'customer2@gmail.com',
    password: '1234',
    phone: '0983460012',
    gender: GENDER.MALE,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  },
  ...Array.from({ length: 50 }).map((_, index) => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: generateVietnamPhoneNumber(),
    verifiedAt: Math.random() > 0.5 ? faker.date.past() : null,
    gender: faker.helpers.arrayElement(Object.values(GENDER)),
    createdAt:
      index < 50
        ? Math.random() > 0.5
          ? new Date()
          : new Date().setDate(new Date().getDate() - 1)
        : faker.date.past(),
    updatedAt: faker.date.past(),
  })),
];

const users = [];
const customers = [];

USER_DATA.map((item) => {
  const newUser = newUserRepository(item);
  users.push(newUser);
});

CUSTOMER_DATA.map((item) => {
  const newCustomer = newCustomerRepository(item);
  customers.push(newCustomer);
});

export { users, customers };
