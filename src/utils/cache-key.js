import { hashObject, sortObject } from '#src/utils/object.util';

export class CacheKey {
  static new(prefix, key) {
    return `${prefix}:${key}`;
  }

  static newList(prefix, keys) {
    if (!Array.isArray(keys)) {
      throw new Error('Cache keys must be array');
    }

    return keys.map((k) => this.new(prefix, k));
  }

  static newPaginationKey(prefix, filters = {}) {
    const sorted = sortObject(filters);
    const hashed = hashObject(sorted);
    return this.new(prefix, hashed);
  }
}
