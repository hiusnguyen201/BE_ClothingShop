import HttpStatus from "http-status-codes";

class HttpException extends Error {
  constructor(message, status = HttpStatus.INTERNAL_SERVER_ERROR, error) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

/**
 * The HTTP response status code will be 400.
 */
export class BadRequestException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.BAD_REQUEST);
    this.message = message;
  }
}

/**
 * The HTTP response status code will be 401.
 */
export class UnauthorizedException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * The HTTP response status code will be 403.
 */
export class ForbiddenException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

/**
 * The HTTP response status code will be 404.
 */
export class NotFoundException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * The HTTP response status code will be 405.
 */
export class MethodNotAllowedException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.METHOD_NOT_ALLOWED);
  }
}

/**
 * The HTTP response status code will be 409.
 */
export class ConflictException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.CONFLICT);
  }
}

/**
 * The HTTP response status code will be 413.
 */
export class PayloadTooLargeException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.REQUEST_TOO_LONG, "Payload Too Large");
  }
}

/**
 * The HTTP response status code will be 415.
 */
export class UnsupportedMediaTypeException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

/**
 * The HTTP response status code will be 429.
 */
export class TooManyRequestException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/**
 * The HTTP response status code will be 500.
 */
export class InternalServerErrorException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * The HTTP response status code will be 502.
 */
export class BadGatewayException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.BAD_GATEWAY);
  }
}

/**
 * The HTTP response status code will be 503.
 */
export class ServiceUnavailableException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
