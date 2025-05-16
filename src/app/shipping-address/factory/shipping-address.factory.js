import { faker } from '@faker-js/faker';
import { createShippingAddressRepository } from '#src/app/shipping-address/shipping-address.repository';

/** @type {import('#src/app/shipping-address/models/shipping-address.model')} */

class ShippingAddressFactory {
  constructor() {
    this.default = {
      address: faker.location.streetAddress(),
      provinceName: faker.location.state(),
      districtName: faker.location.city(),
      wardName: faker.location.county(),
      isDefault: false,
      customer: faker.datatype.uuid(),
    };
  }

  new(overrides = {}) {
    this.default = {
      ...this.default,
      overrides,
    };

    return this.default;
  }

  async createShippingAddress() {
    return createShippingAddressRepository(this.default);
  }
}

export default new ShippingAddressFactory();
