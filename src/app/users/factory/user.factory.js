import { faker } from '@faker-js/faker';
import { GENDER, USER_TYPE } from '#src/app/users/users.constant';
import { createUserRepository } from '#src/app/users/users.repository';
import permissionFactory from '#src/app/permissions/factory/permission.factory';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { generateTokens } from '#src/utils/session.util';

/** @type {import('#src/app/users/models/user.model')} */

class UserFactory {
  constructor() {
    this.default = {
      name: faker.internet.displayName(),
      email: faker.internet.email(),
      type: USER_TYPE.USER,
      password: faker.internet.password(),
      gender: GENDER.FEMALE,
      phone: '0982345678',
      verifiedAt: new Date(),
      role: null,
      permissions: [],
    };
  }

  new(overrides = {}) {
    this.default = {
      ...this.default,
      overrides,
    };

    return this.default;
  }

  async createUser() {
    return createUserRepository(this.default);
  }

  async createUserAuthorizedWithoutPayload() {
    const user = await createUserRepository(this.default);

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokens({});

    return { user: userDto, accessToken };
  }

  async createUserAuthorizedAndUnverified() {
    const user = await createUserRepository({ ...this.default, verifiedAt: null });

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokens({
      id: user._id,
      type: user.type,
    });

    return { user: userDto, accessToken };
  }

  async createUserAuthorized() {
    const user = await createUserRepository(this.default);

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokens({
      id: user._id,
      type: user.type,
    });

    return { user: userDto, accessToken };
  }

  async createCustomerAuthorized() {
    const customer = await createUserRepository({ ...this.default, type: USER_TYPE.CUSTOMER });

    const customerDto = ModelDto.new(UserDto, customer);

    const { accessToken } = await generateTokens({
      id: customer._id,
      type: customer.type,
    });

    return { user: customerDto, accessToken };
  }

  async createUserAuthorizedAndHasPermission(method, endpoint) {
    const permission = await permissionFactory.createPermission({ method, endpoint });

    const user = await createUserRepository({ ...this.default, permissions: [permission._id] });

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokens({
      id: user._id,
      type: user.type,
    });

    return { user: userDto, accessToken };
  }
}

export default new UserFactory();
