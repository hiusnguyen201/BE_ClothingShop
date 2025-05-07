import { faker } from '@faker-js/faker';
import { createShippingAddressService } from '#src/app/shipping-address/shipping-address.service';

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
    return createShippingAddressService(this.default);
  }
}

export default new ShippingAddressFactory();
