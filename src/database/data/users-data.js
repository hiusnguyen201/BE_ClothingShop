/** @type {import('#src/app/users/models/user.model')} */

import { GENDER, USER_TYPE } from '#src/app/users/users.constant';
import { newUserService } from '#src/app/users/users.service';
import { accessControlManagerRoleInstance } from '#src/database/data/roles-data';
import { faker } from '@faker-js/faker';

const VN_PHONE_PREFIXES = ['03', '05', '07', '08', '09'];

const generateVietnamPhoneNumber = () => {
  const prefix = faker.helpers.arrayElement(VN_PHONE_PREFIXES);
  const suffix = faker.string.numeric(8); // 8-digit number
  return `${prefix}${suffix}`;
};

const USER_DATA = [
  {
    name: 'Admin Verified',
    email: 'admin123@gmail.com',
    password: '1234',
    phone: '0383460015',
    verifiedAt: new Date(),
    role: accessControlManagerRoleInstance._id,
    gender: GENDER.MALE,
    type: USER_TYPE.USER,
  },
  ...Array.from({ length: 50 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: generateVietnamPhoneNumber(),
    verifiedAt: Math.random() > 0.5 ? faker.date.past() : null,
    gender: faker.helpers.arrayElement(Object.values(GENDER)),
    type: USER_TYPE.USER,
  })),
];

const CUSTOMER_DATA = Array.from({ length: 200 }).map((_, index) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  phone: generateVietnamPhoneNumber(),
  verifiedAt: Math.random() > 0.5 ? faker.date.past() : null,
  gender: faker.helpers.arrayElement(Object.values(GENDER)),
  type: USER_TYPE.CUSTOMER,
  createdAt:
    index < 50 ? (Math.random() > 0.5 ? new Date() : new Date().setDate(new Date().getDate() - 1)) : faker.date.past(),
}));

const users = [];

[...USER_DATA, ...CUSTOMER_DATA].map((item) => {
  const newUser = newUserService(item);
  users.push(newUser.toObject());
});

export { users };
