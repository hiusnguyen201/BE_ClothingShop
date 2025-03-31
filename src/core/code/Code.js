export class Code {
  static ENTITY_VALIDATION_FAILED = {
    status: 400,
    codeMessage: 'ENTITY_VALIDATION_FAILED',
    message: 'Entity validation failed',
  };

  static BAD_REQUEST = {
    status: 400,
    codeMessage: 'BAD_REQUEST',
    message: 'Bad request',
  };

  static REGION_PHONE_NOT_SUPPORT = {
    status: 400,
    codeMessage: 'REGION_PHONE_NOT_SUPPORT',
    message: 'Region phone number not support',
  };

  static DATABASE_TYPE_NOT_SUPPORT = {
    status: 400,
    codeMessage: 'DATABASE_TYPE_NOT_SUPPORT',
    message: 'Database type not support',
  };

  static INVALID_DATA = {
    status: 400,
    codeMessage: 'INVALID_DATA',
    message: 'Invalid data',
  };

  static FILE_TOO_LARGE = {
    status: 400,
    codeMessage: 'FILE_TOO_LARGE',
    message: 'File too large',
  };

  static WRONG_TOKEN_FORMAT = {
    status: 400,
    codeMessage: 'INVALID_TOKEN',
    message: 'Invalid token format. Please follow: Bearer [token]',
  };

  static TOO_MANY_FILES = {
    status: 400,
    codeMessage: 'TOO_MANY_FILES',
    message: 'Too many files',
  };

  static TOKEN_REQUIRED = {
    status: 400,
    codeMessage: 'TOKEN_REQUIRED',
    message: 'Token is required',
  };

  static INVALID_TOKEN = {
    status: 401,
    codeMessage: 'INVALID_TOKEN',
    message: 'Token is not valid',
  };

  static UNAUTHORIZED = {
    status: 401,
    codeMessage: 'UNAUTHORIZED',
    message: 'Unauthorized',
  };

  static UNVERIFIED = {
    status: 403,
    codeMessage: 'UNVERIFIED_USER',
    message: 'Unverified user',
  };

  static ACCESS_DENIED = {
    status: 403,
    codeMessage: 'ACCESS_DENIED',
    message: 'Access denied',
  };

  static RESOURCE_NOT_FOUND = {
    status: 404,
    codeMessage: 'RESOURCE_NOT_FOUND',
    message: 'Resource not found',
  };

  static ENDPOINT_NOT_FOUND = {
    status: 404,
    codeMessage: 'ENDPOINT_NOT_FOUND',
    message: 'Endpoint not found',
  };

  static CONFLICT = {
    status: 409,
    codeMessage: 'CONFLICT',
    message: 'Conflict',
  };

  static ALREADY_EXISTS = {
    status: 409,
    codeMessage: 'ALREADY_EXISTS',
    message: 'Already exists',
  };

  static BAD_FILE_TYPE = {
    status: 415,
    codeMessage: 'BAD_FILE_TYPE',
    message: 'Invalid file type',
  };

  static UNPROCESSABLE = {
    status: 422,
    codeMessage: 'UNPROCESSABLE',
    message: 'Unprocessable Content',
  };

  static TOO_MANY_REQUESTS = {
    status: 429,
    codeMessage: 'TOO_MANY_REQUESTS',
    message: 'Too many requests',
  };

  static TOO_MANY_SEND_MAIL = {
    status: 429,
    codeMessage: 'TOO_MANY_SEND_MAIL',
    message: 'Too many send mail',
  };

  static SERVER_ERROR = {
    status: 500,
    codeMessage: 'SERVER_ERROR',
    message: 'Internal server error',
  };

  static SEND_MAIL_ERROR = {
    status: 503,
    codeMessage: 'SEND_MAIL_ERROR',
    message: 'Send mail error',
  };

  static FILE_STORAGE_ERROR = {
    status: 503,
    codeMessage: 'FILE_STORAGE_ERROR',
    message: 'File storage error',
  };

  static TIMEOUT_API_RESPONSE = {
    status: 504,
    codeMessage: 'TIMEOUT_API_RESPONSE',
    message: 'Timeout api response',
  };
}
