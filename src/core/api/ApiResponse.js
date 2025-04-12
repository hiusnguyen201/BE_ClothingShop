import { Code } from '#src/core/code/Code';
import HttpStatus from 'http-status-codes';

export class ApiResponse {
  constructor(code, codeMessage, message, data) {
    this.code = code;
    this.codeMessage = codeMessage;
    this.message = message;
    this.timestamp = Date.now();
    this.data = data ?? null;
  }

  static success(data, message) {
    const resultCode = HttpStatus.OK;
    const resultMessage = message || Code.SUCCESS.message;
    const resultCodeMessage = Code.SUCCESS.codeMessage;
    return new ApiResponse(resultCode, resultCodeMessage, resultMessage, data);
  }

  static error(code, codeMessage, message, data) {
    const resultCode = code || HttpStatus.INTERNAL_SERVER_ERROR;
    const resultCodeMessage = codeMessage ?? null;
    const resultMessage = message || HttpStatus.getStatusText(resultCode);
    return new ApiResponse(resultCode, resultCodeMessage, resultMessage, data);
  }
}
