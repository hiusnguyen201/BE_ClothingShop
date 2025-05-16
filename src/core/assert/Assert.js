export class Assert {
  /**
   * Validates if an expression is true, throws an exception if false
   * @param {boolean} expression
   * @param {Error} exception
   * @throws {Error}
   */
  static isTrue(expression, exception) {
    if (!expression) {
      throw exception;
    }
  }

  /**
   * Validates if an expression is false, throws an exception if true
   * @param {boolean} expression
   * @param {Error} exception
   * @throws {Error}
   */
  static isFalse(expression, exception) {
    if (expression) {
      throw exception;
    }
  }

  /**
   * Validates if a value is not empty (null, undefined, empty string, empty array)
   * @param {*} value
   * @param {Error} exception
   * @throws {Error}
   */
  static notEmpty(value, exception) {
    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0);

    if (isEmpty) {
      throw exception;
    }
  }
}
