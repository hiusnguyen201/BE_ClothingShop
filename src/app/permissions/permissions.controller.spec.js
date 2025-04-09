import HttpStatus from 'http-status-codes';
import userFactory from '#src/app/users/factory/user.factory';
import { Code } from '#src/core/code/Code';
import { expectError, testEndpoint, expectValidationError } from '#test/common';

describe('Permission API Endpoints', () => {
  describe('POST /api/permissions/create-permission', () => {
    const method = 'POST';
    const endpoint = '/api/permissions/create-permission';
    const permissionData = {
      name: 'Test Permission',
      description: 'Test Permission Description',
      endpoint: '/api/test',
      method: 'GET',
    };

    const makeRequest = testEndpoint(method, endpoint, permissionData);

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
          name: 'Required fields are missing',
          data: { name: 'Test Permission' },
          invalidPaths: ['description', 'endpoint', 'method'],
        },
        {
          name: 'Invalid method',
          data: { ...permissionData, method: 'INVALID' },
          invalidPaths: ['method'],
        },
        {
          name: 'Invalid endpoint format',
          data: { ...permissionData, endpoint: 'invalid-endpoint' },
          invalidPaths: ['endpoint'],
        },
      ];

      test.each(validationTestCases)('$name', async ({ data, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, data });
        expectValidationError(response, invalidPaths);
      });
    });

    describe('Business Logic', () => {
      test('Permission already exists', async () => {
        const { accessToken, permission } = await userFactory.createPermission();
        const response = await makeRequest({
          accessToken,
          data: { ...permissionData, endpoint: permission.endpoint, method: permission.method },
        });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Create permission successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            name: permissionData.name,
            description: permissionData.description,
            endpoint: permissionData.endpoint,
            method: permissionData.method,
          }),
        });
      });
    });
  });

  describe('GET /api/permissions/get-permission-by-id/:permissionId', () => {
    const method = 'GET';
    const endpoint = '/api/permissions/get-permission-by-id';

    const makeRequest = (permissionId) => testEndpoint(method, `${endpoint}/${permissionId}`);

    describe('Authentication and Authorization', () => {
      const authTestCases = [
        {
          name: 'No access token provided',
          setup: async () => ({ permissionId: 'test' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.TOKEN_REQUIRED.codeMessage,
        },
        {
          name: 'Invalid token',
          setup: async () => ({ permissionId: 'test', accessToken: 'invalidOrExpiredToken' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
      ];

      test.each(authTestCases)('$name', async ({ setup, expectedStatus, expectedCodeMessage }) => {
        const options = await setup();
        const response = await makeRequest(options.permissionId)(options);
        expectError(response, expectedStatus, expectedCodeMessage);
      });
    });

    describe('Business Logic', () => {
      test('Permission not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest('nonExistentPermissionId')({ accessToken });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Get permission by id successful', async () => {
        const { accessToken, permission } = await userFactory.createPermission();
        const response = await makeRequest(permission.id)({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            endpoint: permission.endpoint,
            method: permission.method,
          }),
        });
      });
    });
  });

  describe('PUT /api/permissions/update-permission-by-id/:permissionId', () => {
    const method = 'PUT';
    const endpoint = '/api/permissions/update-permission-by-id';
    const updateData = {
      name: 'Updated Permission',
      description: 'Updated Permission Description',
      endpoint: '/api/updated',
      method: 'POST',
    };

    const makeRequest = (permissionId) => testEndpoint(method, `${endpoint}/${permissionId}`, updateData);

    describe('Authentication and Authorization', () => {
      const authTestCases = [
        {
          name: 'No access token provided',
          setup: async () => ({ permissionId: 'test' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.TOKEN_REQUIRED.codeMessage,
        },
        {
          name: 'Invalid token',
          setup: async () => ({ permissionId: 'test', accessToken: 'invalidOrExpiredToken' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
      ];

      test.each(authTestCases)('$name', async ({ setup, expectedStatus, expectedCodeMessage }) => {
        const options = await setup();
        const response = await makeRequest(options.permissionId)(options);
        expectError(response, expectedStatus, expectedCodeMessage);
      });
    });

    describe('Validation', () => {
      const validationTestCases = [
        {
          name: 'Required fields are missing',
          data: { name: 'Updated Permission' },
          invalidPaths: ['description', 'endpoint', 'method'],
        },
        {
          name: 'Invalid method',
          data: { ...updateData, method: 'INVALID' },
          invalidPaths: ['method'],
        },
        {
          name: 'Invalid endpoint format',
          data: { ...updateData, endpoint: 'invalid-endpoint' },
          invalidPaths: ['endpoint'],
        },
      ];

      test.each(validationTestCases)('$name', async ({ data, invalidPaths }) => {
        const { accessToken, permission } = await userFactory.createPermission();
        const response = await testEndpoint(method, `${endpoint}/${permission.id}`, data)({ accessToken });
        expectValidationError(response, invalidPaths);
      });
    });

    describe('Business Logic', () => {
      test('Permission not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest('nonExistentPermissionId')({ accessToken });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });

      test('Permission already exists', async () => {
        const { accessToken, permission: permission1 } = await userFactory.createPermission();
        const { permission: permission2 } = await userFactory.createPermission();
        const response = await testEndpoint(method, `${endpoint}/${permission1.id}`, {
          ...updateData,
          endpoint: permission2.endpoint,
          method: permission2.method,
        })({ accessToken });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Update permission successful', async () => {
        const { accessToken, permission } = await userFactory.createPermission();
        const response = await makeRequest(permission.id)({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            id: permission.id,
            name: updateData.name,
            description: updateData.description,
            endpoint: updateData.endpoint,
            method: updateData.method,
          }),
        });
      });
    });
  });

  describe('DELETE /api/permissions/remove-permission-by-id/:permissionId', () => {
    const method = 'DELETE';
    const endpoint = '/api/permissions/remove-permission-by-id';

    const makeRequest = (permissionId) => testEndpoint(method, `${endpoint}/${permissionId}`);

    describe('Authentication and Authorization', () => {
      const authTestCases = [
        {
          name: 'No access token provided',
          setup: async () => ({ permissionId: 'test' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.TOKEN_REQUIRED.codeMessage,
        },
        {
          name: 'Invalid token',
          setup: async () => ({ permissionId: 'test', accessToken: 'invalidOrExpiredToken' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
            return { permissionId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
      ];

      test.each(authTestCases)('$name', async ({ setup, expectedStatus, expectedCodeMessage }) => {
        const options = await setup();
        const response = await makeRequest(options.permissionId)(options);
        expectError(response, expectedStatus, expectedCodeMessage);
      });
    });

    describe('Business Logic', () => {
      test('Permission not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest('nonExistentPermissionId')({ accessToken });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });

      test('Permission is in use', async () => {
        const { accessToken, permission } = await userFactory.createPermissionInUse();
        const response = await makeRequest(permission.id)({ accessToken });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Delete permission successful', async () => {
        const { accessToken, permission } = await userFactory.createPermission();
        const response = await makeRequest(permission.id)({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: null,
        });

        const { accessToken: getToken } = await userFactory.createUserAuthorizedAndHasPermission('GET', '/api/permissions/get-permission-by-id');
        const getResponse = await testEndpoint('GET', `/api/permissions/get-permission-by-id/${permission.id}`)({ accessToken: getToken });
        expectError(getResponse, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });
    });
  });
});
