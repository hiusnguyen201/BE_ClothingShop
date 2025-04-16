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
      const validationTestCases = [
        {
          name: 'Invalid page format',
          queryParams: { page: 'invalid' },
          invalidPaths: ['page'],
        },
        {
          name: 'Invalid limit format',
          queryParams: { limit: 'invalid' },
          invalidPaths: ['limit'],
        },
        {
          name: 'Invalid sortBy format',
          queryParams: { sortBy: 123 },
          invalidPaths: ['sortBy'],
        },
        {
          name: 'Invalid sortOrder format',
          queryParams: { sortOrder: 'invalid' },
          invalidPaths: ['sortOrder'],
        },
        {
          name: 'Invalid search format',
          queryParams: { search: 123 },
          invalidPaths: ['search'],
        },
      ];

      test.each(validationTestCases)('$name', async ({ queryParams, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, queryParams });
        expectValidationError(response, invalidPaths);
      });
    });

    describe('Success Cases', () => {
      test('Get permissions successful with default pagination', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                description: expect.any(String),
                endpoint: expect.any(String),
                method: expect.any(String),
              }),
            ]),
            meta: expect.objectContaining({
              totalItems: expect.any(Number),
              itemCount: expect.any(Number),
              itemsPerPage: expect.any(Number),
              totalPages: expect.any(Number),
              currentPage: expect.any(Number),
            }),
          }),
        });
      });

      test('Get permissions successful with custom pagination', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          queryParams: {
            page: 2,
            limit: 5,
            sortBy: 'name',
            sortOrder: 'desc',
            search: 'test',
          },
        });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                description: expect.any(String),
                endpoint: expect.any(String),
                method: expect.any(String),
              }),
            ]),
            meta: expect.objectContaining({
              totalItems: expect.any(Number),
              itemCount: expect.any(Number),
              itemsPerPage: 5,
              totalPages: expect.any(Number),
              currentPage: 2,
            }),
          }),
        });
      });
    });
  });


});
