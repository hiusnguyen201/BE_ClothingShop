import HttpStatus from 'http-status-codes';
import userFactory from '#src/app/users/factory/user.factory';
import roleFactory from '#src/app/roles/factory/role.factory';
import { Code } from '#src/core/code/Code';
import { expectError, testEndpoint, expectValidationError } from '#test/common';

describe('Role API Endpoints', () => {
  describe('POST /api/roles/create-role', () => {
    const method = 'POST';
    const endpoint = '/api/roles/create-role';
    const roleData = {
      name: 'Test Role',
      description: 'Test Role Description',
      permissions: ['permission1', 'permission2'],
    };

    const makeRequest = testEndpoint(method, endpoint, roleData);

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
      test('Invalid name format', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          data: { ...roleData, name: '' },
        });
        expectValidationError(response, ['name']);
      });

      test('Invalid description format', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          data: { ...roleData, description: '' },
        });
        expectValidationError(response, ['description']);
      });
    });

    describe('Business Logic', () => {
      test('Role name already exists', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const role = await roleFactory.createRole();
        const response = await makeRequest({
          accessToken,
          data: { ...roleData, name: role.name },
        });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Create role successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            name: roleData.name,
            description: roleData.description,
            slug: expect.any(String),
          }),
        });
      });
    });
  });

  describe('GET /api/roles/get-role-by-id/:roleId', () => {
    const method = 'GET';
    const endpoint = '/api/roles/get-role-by-id';

    const makeRequest = (roleId) => testEndpoint(method, `${endpoint}/${roleId}`);

    describe('Authentication and Authorization', () => {
      const authTestCases = [
        {
          name: 'No access token provided',
          setup: async () => ({ roleId: 'test' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.TOKEN_REQUIRED.codeMessage,
        },
        {
          name: 'Invalid token',
          setup: async () => ({ roleId: 'test', accessToken: 'invalidOrExpiredToken' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
      ];

      test.each(authTestCases)('$name', async ({ setup, expectedStatus, expectedCodeMessage }) => {
        const options = await setup();
        const response = await makeRequest(options.roleId)(options);
        expectError(response, expectedStatus, expectedCodeMessage);
      });
    });

    describe('Business Logic', () => {
      test('Role not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const response = await makeRequest('nonExistentRoleId')({ accessToken });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Get role by id successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const role = await roleFactory.createRole();
        const response = await makeRequest(role.id)({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            id: role.id,
            name: role.name,
            description: role.description,
            slug: expect.any(String),
          }),
        });
      });
    });
  });

  describe('PUT /api/roles/update-role-by-id/:roleId', () => {
    const method = 'PUT';
    const endpoint = '/api/roles/update-role-by-id';
    const updateData = {
      name: 'Updated Role',
      description: 'Updated Role Description',
      permissions: ['permission3', 'permission4'],
    };

    const makeRequest = (roleId) => testEndpoint(method, `${endpoint}/${roleId}`, updateData);

    describe('Authentication and Authorization', () => {
      const authTestCases = [
        {
          name: 'No access token provided',
          setup: async () => ({ roleId: 'test' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.TOKEN_REQUIRED.codeMessage,
        },
        {
          name: 'Invalid token',
          setup: async () => ({ roleId: 'test', accessToken: 'invalidOrExpiredToken' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
      ];

      test.each(authTestCases)('$name', async ({ setup, expectedStatus, expectedCodeMessage }) => {
        const options = await setup();
        const response = await makeRequest(options.roleId)(options);
        expectError(response, expectedStatus, expectedCodeMessage);
      });
    });

    describe('Validation', () => {
      const validationTestCases = [
        {
          name: 'Required fields are missing',
          data: { name: 'Updated Role' },
          invalidPaths: ['description'],
        },
        {
          name: 'Invalid name format',
          data: { name: 'ab', description: 'Test Description' },
          invalidPaths: ['name'],
        },
        {
          name: 'Invalid description format',
          data: { name: 'Updated Role', description: 'ab' },
          invalidPaths: ['description'],
        },
      ];

      test.each(validationTestCases)('$name', async ({ data, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const role = await roleFactory.createRole();
        const response = await testEndpoint(method, `${endpoint}/${role.id}`, data)({ accessToken });
        expectValidationError(response, invalidPaths);
      });
    });

    describe('Business Logic', () => {
      test('Role not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const response = await makeRequest('nonExistentRoleId')({ accessToken });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });

      test('Role name already exists', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const role1 = await roleFactory.createRole();
        const role2 = await roleFactory.createRole();
        const response = await testEndpoint(method, `${endpoint}/${role1.id}`, {
          ...updateData,
          name: role2.name,
        })({ accessToken });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Update role successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const role = await roleFactory.createRole();
        const response = await makeRequest(role.id)({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            id: role.id,
            name: updateData.name,
            description: updateData.description,
            slug: expect.any(String),
          }),
        });
      });
    });
  });

  describe('DELETE /api/roles/remove-role-by-id/:roleId', () => {
    const method = 'DELETE';
    const endpoint = '/api/roles/remove-role-by-id';

    const makeRequest = (roleId) => testEndpoint(method, `${endpoint}/${roleId}`);

    describe('Authentication and Authorization', () => {
      const authTestCases = [
        {
          name: 'No access token provided',
          setup: async () => ({ roleId: 'test' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.TOKEN_REQUIRED.codeMessage,
        },
        {
          name: 'Invalid token',
          setup: async () => ({ roleId: 'test', accessToken: 'invalidOrExpiredToken' }),
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not found (invalid token)',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.UNAUTHORIZED,
          expectedCodeMessage: Code.INVALID_TOKEN.codeMessage,
        },
        {
          name: 'User not verified',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User is a customer',
          setup: async () => {
            const { accessToken } = await userFactory.createCustomerAuthorized();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
        {
          name: 'User does not have permission',
          setup: async () => {
            const { accessToken } = await userFactory.createUserAuthorized();
            return { roleId: 'test', accessToken };
          },
          expectedStatus: HttpStatus.FORBIDDEN,
          expectedCodeMessage: Code.ACCESS_DENIED.codeMessage,
        },
      ];

      test.each(authTestCases)('$name', async ({ setup, expectedStatus, expectedCodeMessage }) => {
        const options = await setup();
        const response = await makeRequest(options.roleId)(options);
        expectError(response, expectedStatus, expectedCodeMessage);
      });
    });

    describe('Business Logic', () => {
      test('Role not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const response = await makeRequest('nonExistentRoleId')({ accessToken });
        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });

      test('Role is in use', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const role = await roleFactory.createRole();
        await userFactory.createUserAuthorized({ roleId: role.id });
        const response = await makeRequest(role.id)({ accessToken });
        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Delete role successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, `${endpoint}/:roleId`);
        const role = await roleFactory.createRole();
        const response = await makeRequest(role.id)({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: null,
        });

        const getResponse = await testEndpoint('GET', `/api/roles/get-role-by-id/${role.id}`)({ accessToken });
        expectError(getResponse, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });
    });
  });
});
