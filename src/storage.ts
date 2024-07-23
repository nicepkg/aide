import { logger } from './logger'

export interface Storage {
  setItem(key: string, value: string): void
  getItem(key: string): string | null
  removeItem(key: string): void
  clear(): void
  key(index: number): string | null
  readonly length: number
}

export class StateStorage<T extends Record<string, any> = Record<string, any>>
  implements Storage
{
  state: T

  createInitState: () => T

  constructor(createInitState: () => T) {
    this.createInitState = createInitState
    this.state = createInitState()
  }

  setItem<K extends keyof T>(key: K, value: T[K]): void {
    this.state[key] = value
  }

  getItem<K extends keyof T>(key: K): T[K] | null {
    return this.state[key] ?? null
  }

  removeItem<K extends keyof T>(key: K): void {
    delete this.state[key]
  }

  clear(): void {
    this.state = this.createInitState()
  }

  key(index: number): keyof T extends string ? keyof T | null : string | null {
    return Object.keys(this.state)[index] as any
  }

  get length(): number {
    return Object.keys(this.state).length
  }
}

export const stateStorage = new StateStorage<Record<string, any>>(() => ({}))

/**
 * A class that simulates Redis-like storage functionality using a Storage-like object (e.g., localStorage).
 * It provides methods for setting, getting, and managing key-value pairs with optional expiration times.
 *
 * @class
 * @example
 * ```typescript
 * // Initialize RedisStorage with localStorage
 * const redisStorage = new RedisStorage(localStorage);
 *
 * // Set a value with a 60-second expiration time
 * redisStorage.setItem('user:1', JSON.stringify({ name: 'Alice' }), 60);
 *
 * // Get the value
 * const user = JSON.parse(redisStorage.getItem('user:1') || '{}');
 * console.log(user); // { name: 'Alice' }
 *
 * // Check if the key exists
 * console.log(redisStorage.exists('user:1')); // true
 *
 * // Get the remaining TTL
 * console.log(redisStorage.ttl('user:1')); // 59 (or less, depending on when you check)
 *
 * // Set a new expiration time
 * redisStorage.expire('user:1', 120);
 *
 * // Get all keys
 * console.log(redisStorage.keys()); // ['user:1']
 *
 * // Remove the item
 * redisStorage.removeItem('user:1');
 *
 * // Clear all items
 * redisStorage.clear();
 * ```
 */
export class RedisStorage {
  private storage: Storage

  /**
   * Creates an instance of RedisStorage.
   * @param {Storage} storage - A Storage-like object (e.g., localStorage, sessionStorage)
   */
  constructor(storage: Storage) {
    this.storage = storage
  }

  /**
   * Sets a key-value pair in the storage, with an optional expiration time.
   * @param {string} key - The key to set
   * @param {string} value - The value to set
   * @param {number} [ttl=0] - Time to live in seconds. 0 means no expiration.
   */
  setItem(key: string, value: string, ttl: number = 0): void {
    const expiryTime = ttl > 0 ? Date.now() + ttl * 1000 : 0
    const item = { value, expiryTime }
    this.storage.setItem(key, JSON.stringify(item))
  }

  /**
   * Retrieves the value associated with the given key, or null if the key doesn't exist or has expired.
   * @param {string} key - The key to retrieve
   * @returns {string | null} The value associated with the key, or null if not found or expired
   */
  getItem(key: string): string | null {
    const itemStr = this.storage.getItem(key)
    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr)
      if (item.expiryTime && Date.now() > item.expiryTime) {
        this.removeItem(key)
        return null
      }

      return item.value
    } catch (err) {
      logger.warn('RedisStorage.getItem', err)
      return null
    }
  }

  /**
   * Removes the item associated with the given key.
   * @param {string} key - The key to remove
   */
  removeItem(key: string): void {
    this.storage.removeItem(key)
  }

  /**
   * Removes all items from the storage.
   */
  clear(): void {
    this.storage.clear()
  }

  /**
   * Returns the name of the nth key in the storage.
   * @param {number} index - The index of the key to return
   * @returns {string | null} The key at the given index, or null if the index is out of range
   */
  key(index: number): string | null {
    return this.storage.key(index)
  }

  /**
   * Returns the number of items in the storage.
   * @returns {number} The number of items in the storage
   */
  get length(): number {
    return this.storage.length
  }

  /**
   * Checks if a key exists and has not expired.
   * @param {string} key - The key to check
   * @returns {boolean} True if the key exists and has not expired, false otherwise
   */
  exists(key: string): boolean {
    return this.getItem(key) !== null
  }

  /**
   * Returns an array of all non-expired keys in the storage.
   * @returns {string[]} An array of non-expired keys
   */
  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < this.length; i++) {
      const key = this.key(i)
      if (key && this.getItem(key) !== null) {
        keys.push(key)
      }
    }
    return keys
  }

  /**
   * Sets a new expiration time for an existing key.
   * @param {string} key - The key to update
   * @param {number} ttl - The new time to live in seconds
   * @returns {boolean} True if the expiration was set, false if the key doesn't exist
   */
  expire(key: string, ttl: number): boolean {
    const itemStr = this.storage.getItem(key)
    if (!itemStr) return false

    try {
      const item = JSON.parse(itemStr)
      item.expiryTime = Date.now() + ttl * 1000
      this.storage.setItem(key, JSON.stringify(item))
      return true
    } catch (e) {
      logger.warn('RedisStorage.expire', e)
      return false
    }
  }

  /**
   * Returns the remaining time to live of a key that has a timeout.
   * @param {string} key - The key to check
   * @returns {number | null} The remaining time to live in seconds, -1 if the key exists but has no associated expire, or null if the key does not exist
   */
  ttl(key: string): number | null {
    const itemStr = this.storage.getItem(key)
    if (!itemStr) return null

    const item = JSON.parse(itemStr)
    if (!item.expiryTime) return -1 // Never expires
    const remainingTime = Math.ceil((item.expiryTime - Date.now()) / 1000)
    return remainingTime > 0 ? remainingTime : null
  }

  /**
   * Removes all expired keys from the storage.
   */
  cleanup(): void {
    for (let i = 0; i < this.length; i++) {
      const key = this.key(i)
      if (key) this.getItem(key) // This will automatically remove expired items
    }
  }
}

export const redisStorage = new RedisStorage(stateStorage)
/**
 * Creates a cached version of a function using RedisStorage.
 *
 * @template T The type of the function parameters
 * @template R The return type of the function
 * @param {(...args: T) => R | Promise<R>} fn The function to cache
 * @param {number} ttl Time to live for the cache in seconds
 * @param {string | ((...args: T) => string)} [keyGenerator] Custom key generator
 * @param {RedisStorage} [storage] An instance of RedisStorage
 * @returns {(...args: T) => Promise<R>} A new function that caches the result
 *
 * @example
 * ```typescript
 * const redisStorage = new RedisStorage(localStorage);
 *
 * const expensiveCalculation = (a: number, b: number): number => {
 *   console.log('Performing expensive calculation...');
 *   return a + b;
 * };
 *
 * // Using default key generation
 * const cachedCalculation1 = cacheFn(expensiveCalculation, 60);
 *
 * // Using custom string key
 * const cachedCalculation2 = cacheFn(expensiveCalculation, 60, 'myCustomKey');
 *
 * // Using custom key generation function
 * const cachedCalculation3 = cacheFn(
 *   expensiveCalculation,
 *   60,
 *   (a, b) => `sum:${a}:${b}`
 * );
 *
 * // First call - will perform the calculation
 * cachedCalculation1(5, 3).then(result => console.log(result)); // 8
 *
 * // Second call within 60 seconds - will return cached result
 * cachedCalculation1(5, 3).then(result => console.log(result)); // 8 (from cache)
 *
 * // After 60 seconds, it will perform the calculation again
 * ```
 */
export const cacheFn =
  <T extends any[], R>(
    fn: (...args: T) => R | Promise<R>,
    ttl: number,
    keyGenerator?: string | ((...args: T) => string),
    storage: RedisStorage = redisStorage
  ): ((...args: T) => Promise<R>) =>
  async (...args: T): Promise<R> => {
    let key: string

    if (typeof keyGenerator === 'string') {
      key = keyGenerator
    } else if (typeof keyGenerator === 'function') {
      key = keyGenerator(...args)
    } else {
      key = `cache:${fn.name}:${JSON.stringify(args)}`
    }

    const cachedResult = storage.getItem(key)
    if (cachedResult !== null) {
      return JSON.parse(cachedResult)
    }

    const result = await fn(...args)
    storage.setItem(key, JSON.stringify(result), ttl)

    return result
  }
