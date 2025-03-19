export class HttpException extends Error {
  constructor(code, overrideMessage, data) {
    super();

    this.code = code.status;
    this.codeMessage = code.codeMessage;
    this.message = overrideMessage || code.message;
    this.data = data || null;

    Error.captureStackTrace(this, this.constructor);
  }

  static new({ code, overrideMessage, data }) {
    return new HttpException(code, overrideMessage, data);
  }
}
