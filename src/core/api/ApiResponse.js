import HttpStatus from 'http-status-codes';

export class ApiResponse {
  constructor(code, message, data) {
    this.statusCode = code || HttpStatus.OK;
    this.message = message;
    this.timestamp = Date.now();
    this.data = data ?? null;
  }

  static success(data, message) {
    const resultCode = HttpStatus.OK;
    const resultMessage = message || 'Success';
    return new ApiResponse(resultCode, resultMessage, data);
  }

  static error(code, message, data) {
    const resultCode = code || HttpStatus.INTERNAL_SERVER_ERROR;
    const resultMessage = message || HttpStatus.getStatusText(resultCode);
    return new ApiResponse(resultCode, resultMessage, data);
  }
}
