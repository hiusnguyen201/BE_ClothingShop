import HttpStatus from 'http-status-codes';
import request from 'supertest';
import { Code } from '#src/core/code/Code';
import app from '#src/app';
import { ACCESS_TOKEN_KEY } from '#src/utils/cookie.util';

export const testEndpoint = (method, endpoint, data = null) => {
  return async (options = {}) => {
    const { accessToken, headers = {}, queryParams = {} } = options;

    let req = request(app)[method.toLowerCase()](endpoint);

    // Add query parameters if provided
    if (Object.keys(queryParams).length > 0) {
      req = req.query(queryParams);
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
    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      req = req.send(options.data || data);
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
