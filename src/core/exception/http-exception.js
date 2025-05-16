/**
 * Custom HTTP Exception class for handling API errors
 * @extends Error
 */
export class HttpException extends Error {
  /**
   * Creates a new HTTP exception
   * @param {Object} code - Error code object containing status and messages
   * @param {number} code.status - HTTP status code
   * @param {string} code.codeMessage - Error code message
   * @param {string} code.message - Default error message
   * @param {string} [overrideMessage] - Custom message to override default
   * @param {*} [data] - Additional error data
   */
  constructor(code, overrideMessage, data) {
    super();

    this.code = code.status;
    this.codeMessage = code.codeMessage;
    this.message = overrideMessage || code.message;
    this.data = data || null;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory method to create new exception instance
   * @param {Object} params - Exception parameters
   * @param {Object} params.code - Error code object
   * @param {string} [params.overrideMessage] - Custom error message
   * @param {*} [params.data] - Additional error data
   * @returns {HttpException} New exception instance
   * @example
   * throw HttpException.new({
   *   code: Code.NOT_FOUND,
   *   overrideMessage: 'User not found',
   *   data: { userId: 123 }
   * });
   */
  static new({ code, overrideMessage, data }) {
    return new HttpException(code, overrideMessage, data);
  }
}
