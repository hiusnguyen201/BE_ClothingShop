import HttpStatus from 'http-status-codes';
import userFactory from '#src/app/users/factory/user.factory';
import { Code } from '#src/core/code/Code';
import { GENDER } from '#src/app/users/users.constant';
import { expectError, testEndpoint, expectValidationError, expectSuccess } from '#test/common';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import {
  deleteUserFromCache,
  getTotalCountAndListUserFromCache,
  getUserFromCache,
  setTotalCountAndListUserToCache,
  setUserToCache,
} from '#src/app/users/users.cache';
import { getUserByEmailRepository } from '#src/app/users/users.repository';
import { REGEX_PATTERNS } from '#src/core/constant';

export const expectUserData = (data) => {
  expect(data).toMatchObject({
    id: expect.any(String),
    avatar: expect.toBeOneOf([expect.any(String), null]),
    name: expect.any(String),
    email: expect.any(String),
    phone: expect.any(String),
    gender: expect.any(String),
    role: expect.toBeOneOf([expect.any(String), null]),
    verifiedAt: expect.toBeOneOf([expect.any(String), null]),
    lastLoginAt: expect.toBeOneOf([expect.any(String), null]),
  });
};

export const expectUserDataArray = (data) => {
  expect(data.totalCount).toEqual(expect.any(Number));
  expect(Array.isArray(data.list)).toBe(true);
  data.list.forEach((user) => {
    expectUserData(user);
  });
};

// Mock dependencies
jest.mock('#src/modules/mailer/mailer.service', () => ({
  sendPasswordService: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('#src/app/users/users-cache.service', () => ({
  getUserFromCache: jest.fn().mockResolvedValue(null),
  getTotalCountAndListUserFromCache: jest.fn().mockResolvedValue([0, []]),
  setUserToCache: jest.fn().mockImplementation(undefined),
  setTotalCountAndListUserToCache: jest.fn().mockImplementation(undefined),
  deleteUserFromCache: jest.fn().mockImplementation(undefined),
}));

describe('User API Endpoints', () => {
  describe('POST /api/users/is-exist-email', () => {
    const method = 'POST';
    const endpoint = '/api/users/is-exist-email';
    const dataCheckEmail = {
      email: 'user@gmail.com',
    };
    const makeRequest = testEndpoint(method, endpoint);
    describe('Validation', () => {
      const validationTestCases = [
        {
          name: 'Required fields are missing',
          body: {},
          invalidPaths: ['email'],
        },
        {
          name: 'Invalid email format',
          body: { ...dataCheckEmail, email: 'test1' },
          invalidPaths: ['email'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ body, invalidPaths }) => {
        const response = await makeRequest({ body });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Email exists', async () => {
        const user = await userFactory.createUser();
        const response = await makeRequest({
          body: { ...dataCheckEmail, email: user.email },
        });
        expectSuccess(response);
        expect(response.body.data).toEqual(true);
      });
      test('Email not exist', async () => {
        const response = await makeRequest({
          body: dataCheckEmail,
        });
        expectSuccess(response);
        expect(response.body.data).toEqual(false);
      });
    });
  });
  describe('POST /api/users/create-user', () => {
    const method = 'POST';
    const endpoint = '/api/users/create-user';
    const dataCreateUser = {
      name: 'user',
      email: 'user@gmail.com',
      phone: '0982345678',
      gender: GENDER.MALE,
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
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
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
          body: { ...dataCreateUser, email: 'test1' },
          invalidPaths: ['email'],
        },
        {
          name: 'Invalid phone number',
          body: { ...dataCreateUser, phone: '1234' },
          invalidPaths: ['phone'],
        },
        {
          name: 'Invalid gender',
          body: { ...dataCreateUser, gender: '1234' },
          invalidPaths: ['gender'],
        },
        {
          name: 'Invalid roleId',
          body: { ...dataCreateUser, roleId: 123 },
          invalidPaths: ['roleId'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ body, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, body });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Email already exists', async () => {
        const { accessToken, user } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          body: { ...dataCreateUser, email: user.email },
        });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
      test('Role not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          body: { ...dataCreateUser, roleId: '1234' },
        });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });
      test('Create user successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, body: dataCreateUser });
        // Assertions
        expectSuccess(response);
        expectUserData(response.body.data);
        // Verify user was saved in database with hashed password
        const savedUser = await getUserByEmailRepository(dataCreateUser.email, 'password');
        expect(savedUser).not.toBeNull();
        expect(savedUser.password).toMatch(REGEX_PATTERNS.HASH_STRING);
        // Verify email service was called to send password
        expect(sendPasswordService).toHaveBeenCalledTimes(1);
        expect(sendPasswordService).toHaveBeenCalledWith(dataCreateUser.email, expect.any(String));
        // Verify cache was cleared
        expect(deleteUserFromCache).toHaveBeenCalledTimes(1);
      });
      test('Create user with role successful', async () => {
        const { accessToken, user } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          body: { ...dataCreateUser, roleId: user.role },
        });
        // Assertions
        expectSuccess(response);
        expectUserData(response.body.data);
        // Verify user was saved in database with hashed password
        const savedUser = await getUserByEmailRepository(dataCreateUser.email, 'password role');
        expect(savedUser).not.toBeNull();
        expect(savedUser.password).toMatch(REGEX_PATTERNS.HASH_STRING);
        expect(savedUser.role).toEqual(user.role);
        // Verify email service was called to send password
        expect(sendPasswordService).toHaveBeenCalledTimes(1);
        expect(sendPasswordService).toHaveBeenCalledWith(dataCreateUser.email, expect.any(String));
        // Verify cache was cleared
        expect(deleteUserFromCache).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('GET /api/users/get-users', () => {
    const method = 'GET';
    const endpoint = '/api/users/get-users';
    const dataGetListUser = {
      keyword: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
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
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
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
          name: 'Invalid page',
          query: { ...dataGetListUser, page: -1 },
          invalidPaths: ['page'],
        },
        {
          name: 'Invalid limit',
          query: { ...dataGetListUser, limit: -10 },
          invalidPaths: ['limit'],
        },
        {
          name: 'Invalid sortBy',
          query: { ...dataGetListUser, sortBy: 'key' },
          invalidPaths: ['sortBy'],
        },
        {
          name: 'Invalid sortOrder',
          query: { ...dataGetListUser, sortOrder: 'order' },
          invalidPaths: ['sortOrder'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ query, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, query });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Get list user successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken });
        // Assertions
        expectSuccess(response);
        expectUserDataArray(response.body.data);
        // Verify cache was cleared
        expect(getTotalCountAndListUserFromCache).toHaveBeenCalledTimes(1);
        expect(setTotalCountAndListUserToCache.mock.calls.length).toBeLessThanOrEqual(1);
      });
    });
  });
  describe('GET /api/users/get-user-by-id/:userId', () => {
    const method = 'GET';
    const endpoint = '/api/users/get-user-by-id/:userId';
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
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
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
          name: 'Invalid userId',
          params: { userId: undefined },
          invalidPaths: ['userId'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ params, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Get user successful', async () => {
        // Mock user
        const user = await userFactory.createUser();
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params: { userId: user._id } });
        // Assertions
        expectSuccess(response);
        expectUserData(response.body.data);
        // Verify cache was cleared
        expect(getUserFromCache).toHaveBeenCalledTimes(1);
        expect(setUserToCache.mock.calls.length).toBeLessThanOrEqual(1);
      });
    });
  });
  describe('PUT /api/users/update-user-by-id/:userId', () => {
    const method = 'PUT';
    const endpoint = '/api/users/update-user-by-id/:userId';
    const dataUpdateUser = {
      name: 'user',
      email: 'user@gmail.com',
      phone: '0982345678',
      gender: GENDER.MALE,
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
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
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
          name: 'Invalid userId',
          params: { userId: undefined },
          body: dataUpdateUser,
          invalidPaths: ['userId'],
        },
        {
          name: 'Invalid email format',
          body: { ...dataUpdateUser, email: 'test1' },
          invalidPaths: ['email'],
        },
        {
          name: 'Invalid phone number',
          body: { ...dataUpdateUser, phone: '1234' },
          invalidPaths: ['phone'],
        },
        {
          name: 'Invalid gender',
          body: { ...dataUpdateUser, gender: '1234' },
          invalidPaths: ['gender'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ body, params, invalidPaths }) => {
        const user = await userFactory.createUser();
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params: { userId: user._id, ...params }, body });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Update user info successful', async () => {
        // Mock user
        const user = await userFactory.createUser();
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params: { userId: user._id }, body: dataUpdateUser });
        // Assertions
        expectSuccess(response);
        expectUserData(response.body.data);
        // Verify cache was cleared
        expect(deleteUserFromCache).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('DELETE /api/users/remove-user-by-id/:userId', () => {
    const method = 'DELETE';
    const endpoint = '/api/users/remove-user-by-id/:userId';
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
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
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
          name: 'Invalid userId',
          params: { userId: undefined },
          invalidPaths: ['userId'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ params, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Remove user successful', async () => {
        // Mock user
        const user = await userFactory.createUser();
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params: { userId: user._id } });
        // Assertions
        expectSuccess(response);
        expect(response.body.data.id).toEqual(expect.any(String));
        // Verify cache was cleared
        expect(deleteUserFromCache).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('PUT /api/users/:userId/reset-password', () => {
    const method = 'PUT';
    const endpoint = '/api/users/:userId/reset-password';
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
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
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
          name: 'Invalid userId',
          params: { userId: undefined },
          invalidPaths: ['userId'],
        },
      ];
      test.each(validationTestCases)('$name', async ({ params, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params });
        expectValidationError(response, invalidPaths);
      });
    });
    describe('Business Logic', () => {
      test('Reset user successful', async () => {
        // Mock user
        const user = await userFactory.createUser();
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, params: { userId: user._id } });
        // Assertions
        expectSuccess(response);
        expect(response.body.data.id).toEqual(expect.any(String));
        // Verify cache was cleared
        expect(sendPasswordService).toHaveBeenCalledTimes(1);
      });
    });
  });
});
