import HttpStatus from 'http-status-codes';
import userFactory from '#src/app/users/factory/user.factory';
import { Code } from '#src/core/code/Code';
import { GENDER } from '#src/app/users/users.constant';
import { expectError, testEndpoint, expectValidationError } from '#test/common';

export const expectUserData = (userData) => {
  expect(userData).toMatchObject({
    id: expect.any(String),
    avatar: expect.toBeOneOf([expect.any(String), null]),
    name: expect.any(String),
    email: expect.any(String),
    phone: expect.any(String),
    gender: expect.any(String),
    verifiedAt: expect.toBeOneOf([expect.any(String), null]),
    lastLoginAt: expect.toBeOneOf([expect.any(String), null]),
  });
};

describe('User API Endpoints', () => {
  describe('POST /api/users/create-user', () => {
    const method = 'POST';
    const endpoint = '/api/users/create-user';
    const dataCreateUser = {
      name: 'user',
      email: 'user@gmail.com',
      phone: '0982345678',
      gender: GENDER.MALE,
    };

    const makeRequest = testEndpoint(method, endpoint, dataCreateUser);

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
          data: { name: 'test1' },
          invalidPaths: ['email', 'phone', 'gender'],
        },
        {
          name: 'Invalid email format',
          data: { ...dataCreateUser, email: 'test1' },
          invalidPaths: ['email'],
        },
        {
          name: 'Invalid phone number',
          data: { ...dataCreateUser, phone: '1234' },
          invalidPaths: ['phone'],
        },
        {
          name: 'Invalid gender',
          data: { ...dataCreateUser, gender: '1234' },
          invalidPaths: ['gender'],
        },
        {
          name: 'Invalid roleId',
          data: { ...dataCreateUser, roleId: 123 },
          invalidPaths: ['roleId'],
        },
      ];

      test.each(validationTestCases)('$name', async ({ data, invalidPaths }) => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken, data });

        expectValidationError(response, invalidPaths);
      });
    });

    describe('Business Logic', () => {
      test('Email already exists', async () => {
        const { accessToken, user } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          data: { ...dataCreateUser, email: user.email },
        });

        expectError(response, HttpStatus.CONFLICT, Code.ALREADY_EXISTS.codeMessage);
      });

      test('Role not found', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          data: { ...dataCreateUser, roleId: '1234' },
        });

        expectError(response, HttpStatus.NOT_FOUND, Code.RESOURCE_NOT_FOUND.codeMessage);
      });
    });

    describe('Success Cases', () => {
      test('Create user successful', async () => {
        const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({ accessToken });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.any(Object),
        });

        expectUserData(response.body.data);
      });

      test('Create user with role successful', async () => {
        const { accessToken, user } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);
        const response = await makeRequest({
          accessToken,
          data: { ...dataCreateUser, roleId: user.role },
        });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toMatchObject({
          code: HttpStatus.OK,
          codeMessage: Code.SUCCESS.codeMessage,
          message: expect.any(String),
          data: expect.any(Object),
        });

        expectUserData(response.body.data);
      });
    });
  });
});

// describe('POST /api/users/create-user', () => {
//   const method = 'POST';
//   const endpoint = '/api/users/create-user';
//   const dataCreateUser = {
//     name: 'user',
//     email: 'user@gmail.com',
//     phone: '0982345678',
//     gender: GENDER.MALE,
//   };

//   describe('Access token is not provided', () => {
//     test('should return 401 if no access token is provided', async () => {
//       const response = await request(app)[method.toLowerCase()](endpoint).send(dataCreateUser);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.UNAUTHORIZED,
//         codeMessage: Code.TOKEN_REQUIRED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('Invalid or expired token', () => {
//     test('should return 401 if the token is invalid', async () => {
//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send(dataCreateUser)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=invalidOrExpiredToken`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.UNAUTHORIZED,
//         codeMessage: Code.INVALID_TOKEN.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User not found', () => {
//     test('should return 401 if the user does not exist (invalid token)', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send(dataCreateUser)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.UNAUTHORIZED,
//         codeMessage: Code.INVALID_TOKEN.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User not verified', () => {
//     test('should return 403 if the user is not verified', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send(dataCreateUser)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.FORBIDDEN);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.FORBIDDEN,
//         codeMessage: Code.ACCESS_DENIED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User is a customer', () => {
//     test('should return 403 Forbidden if the user is a CUSTOMER', async () => {
//       const { accessToken } = await userFactory.createCustomerAuthorized();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send(dataCreateUser)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.FORBIDDEN);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.FORBIDDEN,
//         codeMessage: Code.ACCESS_DENIED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User does not have permission', () => {
//     test('should return 403 Forbidden if the user does not have CREATE USER permission', async () => {
//       const { accessToken } = await userFactory.createUserAuthorized();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send(dataCreateUser)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.FORBIDDEN);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.FORBIDDEN,
//         codeMessage: Code.ACCESS_DENIED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('Required fields are missing (Body)', () => {
//     test('should return 400 if required fields are missing', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ name: 'test1' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([
//           { path: 'email', message: expect.any(String) },
//           { path: 'phone', message: expect.any(String) },
//           { path: 'gender', message: expect.any(String) },
//         ]),
//       });
//     });
//   });

//   describe('Email format is invalid (Body)', () => {
//     test('should return 400 if required fields are missing', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ ...dataCreateUser, email: 'test1' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'email', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Invalid phone number (Body)', () => {
//     test('should return 400 if phone number is invalid', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ ...dataCreateUser, phone: '1234' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'phone', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Invalid gender (Body)', () => {
//     test('should return 400 if gender is invalid', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ ...dataCreateUser, gender: '1234' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'gender', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Invalid roleId (Body)', () => {
//     test('should return 404 if roleId is invalid', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ ...dataCreateUser, roleId: 123 })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'roleId', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Email already exists', () => {
//     test('should return 409 if email already exists', async () => {
//       const { accessToken, user } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ ...dataCreateUser, email: user.email })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.CONFLICT);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.CONFLICT,
//         codeMessage: Code.ALREADY_EXISTS.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('Role not found', () => {
//     test('should return 404 if role not found', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ ...dataCreateUser, roleId: '1234' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.NOT_FOUND);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.NOT_FOUND,
//         codeMessage: Code.RESOURCE_NOT_FOUND.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('Create user successful', () => {
//     test('should return 200 and the created user data', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send(dataCreateUser)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.OK);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.OK,
//         codeMessage: Code.SUCCESS.codeMessage,
//         message: expect.any(String),
//         data: expect.objectContaining({
//           id: expect.any(String),
//           avatar: expect.toBeOneOf([expect.any(String), null]),
//           name: expect.any(String),
//           email: expect.any(String),
//           phone: expect.any(String),
//           gender: expect.any(String),
//           verifiedAt: expect.toBeOneOf([expect.any(String), null]),
//           lastLoginAt: expect.toBeOneOf([expect.any(String), null]),
//         }),
//       });
//     });
//   });

//   describe('Create user with role successful', () => {
//     test('should return 200 and the created user data', async () => {
//       const { accessToken, user } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .send({ ...dataCreateUser, roleId: user.role })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.OK);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.OK,
//         codeMessage: Code.SUCCESS.codeMessage,
//         message: expect.any(String),
//         data: expect.objectContaining({
//           id: expect.any(String),
//           avatar: expect.toBeOneOf([expect.any(String), null]),
//           name: expect.any(String),
//           email: expect.any(String),
//           phone: expect.any(String),
//           gender: expect.any(String),
//           verifiedAt: expect.toBeOneOf([expect.any(String), null]),
//           lastLoginAt: expect.toBeOneOf([expect.any(String), null]),
//         }),
//       });
//     });
//   });
// });

// describe('GET /api/users/get-users', () => {
//   const method = 'GET';
//   const endpoint = '/api/users/get-users';

//   describe('Access token is not provided', () => {
//     test('should return 401 if no access token is provided', async () => {
//       const response = await request(app)[method.toLowerCase()](endpoint);
//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.UNAUTHORIZED,
//         codeMessage: Code.TOKEN_REQUIRED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('Invalid or expired token', () => {
//     test('should return 401 if the token is invalid', async () => {
//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=invalidOrExpiredToken`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.UNAUTHORIZED,
//         codeMessage: Code.INVALID_TOKEN.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User not found', () => {
//     test('should return 401 if the user does not exist (invalid token)', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedWithoutPayload();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.UNAUTHORIZED,
//         codeMessage: Code.INVALID_TOKEN.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User not verified', () => {
//     test('should return 403 if the user is not verified', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndUnverified();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.FORBIDDEN);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.FORBIDDEN,
//         codeMessage: Code.ACCESS_DENIED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User is a customer', () => {
//     test('should return 403 Forbidden if the user is a CUSTOMER', async () => {
//       const { accessToken } = await userFactory.createCustomerAuthorized();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.FORBIDDEN);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.FORBIDDEN,
//         codeMessage: Code.ACCESS_DENIED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('User does not have permission', () => {
//     test('should return 403 Forbidden if the user does not have CREATE USER permission', async () => {
//       const { accessToken } = await userFactory.createUserAuthorized();

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.FORBIDDEN);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.FORBIDDEN,
//         codeMessage: Code.ACCESS_DENIED.codeMessage,
//         message: expect.any(String),
//         data: expect.toBeOneOf([null]),
//       });
//     });
//   });

//   describe('Invalid page (Query)', () => {
//     test('should return 400 if page is less than 1', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .query({ page: -1 })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'page', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Invalid limit (Query)', () => {
//     test('should return 400 if limit is limit than 10', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .query({ limit: 5 })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'limit', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Invalid sortBy (Query)', () => {
//     test('should return 400 if sortBy is not valid', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .query({ sortBy: 'deleted' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'sortBy', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Invalid sortOrder (Query)', () => {
//     test('should return 400 if sortOrder is not valid', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .query({ sortOrder: 'lastest' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       // console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'sortOrder', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Invalid gender (Query)', () => {
//     test('should return 400 if gender is not valid', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .query({ gender: 'a' })
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.BAD_REQUEST,
//         codeMessage: Code.INVALID_DATA.codeMessage,
//         message: expect.any(String),
//         data: expect.arrayContaining([{ path: 'gender', message: expect.any(String) }]),
//       });
//     });
//   });

//   describe('Get list user successful', () => {
//     test('should return 200 and list user', async () => {
//       const { accessToken } = await userFactory.createUserAuthorizedAndHasPermission(method, endpoint);

//       const response = await request(app)
//         [method.toLowerCase()](endpoint)
//         .set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);

//       //   console.log(response.body);

//       // Expect
//       expect(response.status).toBe(HttpStatus.OK);
//       expect(response.body).toMatchObject({
//         code: HttpStatus.OK,
//         codeMessage: Code.SUCCESS.codeMessage,
//         message: expect.any(String),
//         data: expect.objectContaining({
//           totalCount: expect.any(Number),
//           list: expect.arrayContaining([
//             expect.objectContaining({
//               id: expect.any(String),
//               avatar: expect.toBeOneOf([expect.any(String), null]),
//               name: expect.any(String),
//               email: expect.any(String),
//               phone: expect.any(String),
//               gender: expect.any(String),
//               verifiedAt: expect.toBeOneOf([expect.any(String), null]),
//               lastLoginAt: expect.toBeOneOf([expect.any(String), null]),
//             }),
//           ]),
//         }),
//       });
//     });
//   });
// });
