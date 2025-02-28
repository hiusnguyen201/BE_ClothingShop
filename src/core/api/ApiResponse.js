import HttpStatus from 'http-status-codes';

export class ApiResponse {
  constructor(code, message, data) {
    this.statusCode = code;
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
  }

  static success(data, message) {
    const resultCode = this.code || HttpStatus.OK;
    const resultMessage = message || 'Success';
    return new ApiResponse(resultCode, resultMessage, data);
  }

  static error(message, data) {
    const resultCode = this.code || HttpStatus.INTERNAL_SERVER_ERROR;
    const resultMessage = message || HttpStatus.getStatusText(resultCode);
    return new ApiResponse(resultCode, resultMessage, data);
  }

  static statusCode(code) {
    this.code = code;
    return this;
  }
}
