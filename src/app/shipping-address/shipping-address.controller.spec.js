import { REGEX_PATTERNS } from '#src/core/constant';
import HttpStatus from 'http-status-codes';
import { Code } from '#src/core/code/Code';
import shippingAddressFactory from '#src/app/shipping-address/factory/shipping-address.factory';
import { expectError, testEndpoint, expectValidationError, expectSuccess } from '#test/common';
import {
  getShippingAddressFromCache,
  getTotalCountAndListShippingAddressFromCache,
  setShippingAddressToCache,
  setTotalCountAndListShippingAddressToCache,
  deleteShippingAddressFromCache,
} from '#src/app/shipping-address/shipping-address-cache.service';

export const expectShippingAddressData = (data) => {
  expect(data).toMatchObject({
    id: expect.any(String),
    address: expect.any(String),
    provinceName: expect.any(String),
    districtName: expect.any(String),
    wardName: expect.any(String),
    isDefault: expect.any(Boolean),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  });
};

export const expectShippingAddressDataArray = (data) => {
  expect(data.totalCount).toEqual(expect.any(Number));
  expect(Array.isArray(data.list)).toBe(true);
  data.list.forEach((user) => {
    expectShippingAddressData(user);
  });
};

// Mock dependencies
jest.mock('#src/app/shipping-address/shipping-address-cache.service', () => ({
  getShippingAddressFromCache: jest.fn().mockResolvedValue(null),
  getTotalCountAndListShippingAddressFromCache: jest.fn().mockResolvedValue([0, []]),
  setShippingAddressToCache: jest.fn().mockImplementation(undefined),
  setTotalCountAndListShippingAddressToCache: jest.fn().mockImplementation(undefined),
  deleteShippingAddressFromCache: jest.fn().mockImplementation(undefined),
}));

describe('Shipping Address API Endpoints', () => {
  describe('POST /api/shipping-address/create-user', () => {
    const method = 'POST';
    const endpoint = '/api/shipping-address/create-shipping-address';
    const dataCreateShippingAddress = {
      address: '15 ngo hoang an a',
      provinceId: 201, // Hà Nội
      districtId: 1486, // Quận Đống Đa
      wardCode: '1A0403', // Phường Khâm Thiên
      isDefault: true,
    };
    const makeRequest = testEndpoint(method, endpoint);
    describe('Authentication and Authorization', () => {
      const authTestCases = [
        {
          name: 'No access token provided',
          setup: async () => ({}),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.TOKEN_REQUIRED.codeMessage,
        },
        {
          name: 'Invalid token',
          setup: async () => ({ accessToken: 'invalidOrExpiredToken' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'ShippingAddress not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createShippingAddressAuthorizedWithoutPayload();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'ShippingAddress not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createShippingAddressAuthorizedAndUnverified();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'ShippingAddress is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'ShippingAddress does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createShippingAddressAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
      ];
      test.each(authTestCases)('$name', async ({ setup, expectedStatus, expectedCodeMessage }) => {
        const options = await setup();
        const response = await makeRequest(options);
        expectError(response, expectedStatus, expectedCodeMessage);
      });
    });
    describe('Validation', () => {
      const validationTestCases = [
        {
          name: 'Required fields are missing',
          body: { name: 'test1' },
          invalidPaths: ['email', 'phone', 'gender'],
        },
        {
          name: 'Invalid email format',
          body: { ...dataCreateShippingAddress, email: 'test1' },
          invalidPaths: ['email'],
        },
        {
          name: 'Invalid phone number',
          body: { ...dataCreateShippingAddress, phone: '1234' },
          invalidPaths: ['phone'],
        },
        {
          name: 'Invalid gender',
          body: { ...dataCreateShippingAddress, gender: '1234' },
          invalidPaths: ['gender'],
        },
        {
          name: 'Invalid roleId',
          body: { ...dataCreateShippingAddress, roleId: 123 },
          invalidPaths: ['roleId'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ body, invalidPaths }) => {
        const { accessToken } = await userFactory.createShippingAddressAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, body });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Email already exists', async () => {
        const { accessToken, user } = await userFactory.createShippingAddressAuthorizedAndHasPermission(
          method,
          endpoint,
        );
        const response = await makeRequest({
          accessToken,
          body: { ...dataCreateShippingAddress, email: user.email },
        });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
      test('Role not found', async () => {
        const { accessToken } = await userFactory.createShippingAddressAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          body: { ...dataCreateShippingAddress, roleId: '1234' },
        });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });
      test('Create user successful', async () => {
        const { accessToken } = await userFactory.createShippingAddressAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, body: dataCreateShippingAddress });
        // Assertions
        expectSuccess(response);
        expectShippingAddressData(response.body.data);
        // Verify user was saved in database with hashed password
        const savedShippingAddress = await getShippingAddressByEmailService(
          dataCreateShippingAddress.email,
          'password',
        );
        expect(savedShippingAddress).not.toBeNull();
        expect(savedShippingAddress.password).toMatch(REGEX_PATTERNS.HASH_STRING);
        // Verify email service was called to send password
        expect(sendPasswordService).toHaveBeenCalledTimes(1);
        expect(sendPasswordService).toHaveBeenCalledWith(dataCreateShippingAddress.email, expect.any(String));
        // Verify cache was cleared
        expect(deleteShippingAddressFromCache).toHaveBeenCalledTimes(1);
      });
      test('Create user with role successful', async () => {
        const { accessToken, user } = await userFactory.createShippingAddressAuthorizedAndHasPermission(
          method,
          endpoint,
        );
        const response = await makeRequest({
          accessToken,
          body: { ...dataCreateShippingAddress, roleId: user.role },
        });
        // Assertions
        expectSuccess(response);
        expectShippingAddressData(response.body.data);
        // Verify user was saved in database with hashed password
        const savedShippingAddress = await getShippingAddressByEmailService(
          dataCreateShippingAddress.email,
          'password role',
        );
        expect(savedShippingAddress).not.toBeNull();
        expect(savedShippingAddress.password).toMatch(REGEX_PATTERNS.HASH_STRING);
        expect(savedShippingAddress.role).toEqual(user.role);
        // Verify email service was called to send password
        expect(sendPasswordService).toHaveBeenCalledTimes(1);
        expect(sendPasswordService).toHaveBeenCalledWith(dataCreateShippingAddress.email, expect.any(String));
        // Verify cache was cleared
        expect(deleteShippingAddressFromCache).toHaveBeenCalledTimes(1);
      });
    });
  });
});
