import HttpStatus from 'http-status-codes';
import request from 'supertest';
import { Code } from '#src/core/code/Code';
import app from '#src/app';
import { ACCESS_TOKEN_KEY } from '#src/utils/cookie.util';

/**
 * Usage: https://jestjs.io/docs/api#testeachtablename-fn-timeout
 */

export const testEndpoint = (method, endpoint) => {
  return async (options = {}) => {
    const { accessToken, headers = {}, query = {}, params = {}, body = {} } = options;

    // Replace URL parameters
    const parsedEndpoint = Object.entries(params).reduce(
      (path, [key, value]) => path.replace(`:${key}`, value),
      endpoint,
    );

    let req = request(app)[method.toLowerCase()](parsedEndpoint);

    // Add query if provided
    if (Object.keys(query).length > 0) {
      req = req.query(query);
    }

    // Add access token if provided
    if (accessToken) {
      req = req.set('Cookie', [`${ACCESS_TOKEN_KEY}=${accessToken}`]);
    }

    // Add custom headers if provided
    Object.entries(headers).forEach(([key, value]) => {
      req = req.set(key, value);
    });

    // Send data if provided
    if (body && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      req = req.send(options.body || body);
    }

    return req;
  };
};

//  Expectations
export const expectError = (response, expectedStatus, expectedCodeMessage) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toMatchObject({
    code: expectedStatus,
    codeMessage: expectedCodeMessage,
    message: expect.any(String),
    data: expect.toBeOneOf([null]),
  });
};

export const expectValidationError = (response, paths) => {
  expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  expect(response.body).toMatchObject({
    code: HttpStatus.BAD_REQUEST,
    codeMessage: Code.INVALID_DATA.codeMessage,
    message: expect.any(String),
    data: expect.arrayContaining(paths.map((path) => ({ path, message: expect.any(String) }))),
  });
};

export const expectSuccess = (response) => {
  expect(response.status).toBe(HttpStatus.OK);
  expect(response.body).toMatchObject({
    code: HttpStatus.OK,
    codeMessage: Code.SUCCESS.codeMessage,
    message: expect.any(String),
    data: expect.toBeOneOf([
      expect.any(String),
      expect.any(Number),
      expect.any(Object),
      expect.any(Array),
      expect.any(Boolean),
      null,
    ]),
  });
};
