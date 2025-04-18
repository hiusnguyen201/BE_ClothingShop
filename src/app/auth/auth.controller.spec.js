import HttpStatus from 'http-status-codes';
import userFactory from '#src/app/users/factory/user.factory';
import { Code } from '#src/core/code/Code';
import { expectError, testEndpoint, expectValidationError } from '#test/common';

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/login', () => {
    const method = 'POST';
    const endpoint = '/api/auth/login';
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const makeRequest = testEndpoint(method, endpoint, loginData);

    describe('Validation', () => {
      const validationTestCases = [
        {
          name: 'Required fields are missing',
          data: { email: 'test@example.com' },
          invalidPaths: ['password'],
        },
        {
          name: 'Invalid email format',
          data: { ...loginData, email: 'invalid-email' },
          invalidPaths: ['email'],
        },
        {
          name: 'Invalid password format',
          data: { ...loginData, password: 'invalid-123' },
          invalidPaths: ['password'],
        },
      ];

      test.each(validationTestCases)('$name', async ({ data, invalidPaths }) => {
        const response = await makeRequest({ data });
        expectValidationError(response, invalidPaths);
      });
    });

    describe('Business Logic', () => {
      test('User not found', async () => {
        const response = await makeRequest({
          data: {
            email: 'nonexistent@example.com',
            password: 'password123',
          },
        });
        expectError(response, HttpStatus.UNAUTHORIZED, Code.INVALID_CREDENTIALS.codeMessage);
      });

      test('Invalid password', async () => {
        const { user } = await userFactory.createUser();
        console.log('Created user:', user); // Debugging line
        const response = await makeRequest({
          data: {
            email: user.email,
            password: 'wrongpassword',
          },
        });
        expectError(response, HttpStatus.UNAUTHORIZED, Code.INVALID_CREDENTIALS.codeMessage);
      });

      test('User not verified', async () => {
        const { user } = await userFactory.createUserUnverified();
        const response = await makeRequest({
          data: {
            email: user.email,
            password: 'password123',
          },
        });
        expectError(response, HttpStatus.FORBIDDEN, Code.ACCESS_DENIED.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Login successful', async () => {
        const { user } = await userFactory.createUser();
        const response = await makeRequest({
          data: {
            email: user.email,
            password: 'password123',
          },
        });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            user: expect.objectContaining({
              id: user.id,
              email: user.email,
              name: user.name,
            }),
          }),
        });
      });
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    const method = 'POST';
    const endpoint = '/api/auth/refresh-token';
    const refreshData = {
      refreshToken: 'valid-refresh-token',
    };

    const makeRequest = testEndpoint(method, endpoint, refreshData);

    describe('Validation', () => {
      test('Refresh token is required', async () => {
        const response = await makeRequest({ data: {} });
        expectValidationError(response, ['refreshToken']);
      });
    });

    describe('Business Logic', () => {
      test('Invalid refresh token', async () => {
        const response = await makeRequest({
          data: { refreshToken: 'invalid-token' },
        });
        expectError(response, HttpStatus.UNAUTHORIZED, Code.REFRESH_TOKEN_FAILED.codeMessage);
      });

      test('Expired refresh token', async () => {
        const { refreshToken } = await userFactory.createUserWithExpiredRefreshToken();
        const response = await makeRequest({
          data: { refreshToken },
        });
        expectError(response, HttpStatus.UNAUTHORIZED, Code.REFRESH_TOKEN_FAILED.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Refresh token successful', async () => {
        const { refreshToken } = await userFactory.createUserWithValidRefreshToken();
        const response = await makeRequest({
          data: { refreshToken },
        });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          }),
        });
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    const method = 'POST';
    const endpoint = '/api/auth/logout';

    const makeRequest = testEndpoint(method, endpoint);

    describe('Authentication', () => {
      test('No access token provided', async () => {
        const response = await makeRequest();
        expectError(response, HttpStatus.UNAUTHORIZED, Code.TOKEN_REQUIRED.codeMessage);
      });

      test('Invalid token', async () => {
        const response = await makeRequest({ accessToken: 'invalid-token' });
        expectError(response, HttpStatus.UNAUTHORIZED, Code.INVALID_TOKEN.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Logout successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorized();
        const response = await makeRequest({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: null,
        });
      });
    });
  });
});
