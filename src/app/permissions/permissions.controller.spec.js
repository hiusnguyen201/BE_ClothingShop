import HttpStatus from 'http-status-codes';
import userFactory from '#src/app/users/factory/user.factory';
import { Code } from '#src/core/code/Code';
import { expectError, testEndpoint, expectValidationError } from '#test/common';

describe('Permission API Endpoints', () => {
  describe('GET /api/permissions/get-permissions', () => {
    const method = 'GET';
    const endpoint = '/api/permissions/get-permissions';

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
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
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
      test('Invalid page number', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          queryParams: { page: 'invalid' },
        });
        expectValidationError(response, ['page']);
      });

      test('Invalid limit', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          queryParams: { limit: 'invalid' },
        });
        expectValidationError(response, ['limit']);
      });
    });

    describe('Success Cases', () => {
      test('Get permissions successfully', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: {
            list: expect.any(Array),
            totalCount: expect.any(Number),
            page: expect.any(Number),
            limit: expect.any(Number),
          },
        });
      });
    });
  });
});
