export class Assert {
  static isTrue(condition, exception) {
    if (!condition) {
      throw exception;
    }
  }

  static isFalse(condition, exception) {
    if (condition) {
      throw exception;
    }
  }

  static notEmpty(value, exception) {
    if (value === null || value === undefined) {
      throw exception;
    }
  }

  static isArray(arr, exception) {
    if (!Array.isArray(arr)) {
      throw exception;
    }
  }
}
