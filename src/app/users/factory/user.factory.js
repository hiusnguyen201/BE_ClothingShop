import { faker } from '@faker-js/faker';
import { GENDER, USER_TYPE } from '#src/app/users/users.constant';
import { createUserService } from '#src/app/users/users.service';
import permissionFactory from '#src/app/permissions/factory/permission.factory';
import { generateTokensService } from '#src/app/auth/auth.service';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { ModelDto } from '#src/core/dto/ModelDto';

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
    return createUserService(this.default);
  }

  async createUserAuthorizedWithoutPayload() {
    const user = await createUserService(this.default);

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokensService(user._id, {});

    return { user: userDto, accessToken };
  }

  async createUserAuthorizedAndUnverified() {
    const user = await createUserService({ ...this.default, verifiedAt: null });

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokensService(user._id, userDto);

    return { user: userDto, accessToken };
  }

  async createUserAuthorized() {
    const user = await createUserService(this.default);

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokensService(user._id, userDto);

    return { user: userDto, accessToken };
  }

  async createCustomerAuthorized() {
    const user = await createUserService({ ...this.default, type: USER_TYPE.CUSTOMER });

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokensService(user._id, userDto);

    return { user: userDto, accessToken };
  }

  async createUserAuthorizedAndHasPermission(method, endpoint) {
    const permission = await permissionFactory.createPermission({ method, endpoint });

    const user = await createUserService({ ...this.default, permissions: [permission._id] });

    const userDto = ModelDto.new(UserDto, user);

    const { accessToken } = await generateTokensService(user._id, userDto);

    return { user: userDto, accessToken };
  }
}

export default new UserFactory();
