/**
 * In-memory storage for single-instance backend
 * Replaces Redis for simplified deployment
 */

interface StorageValue {
  value: string;
  expiresAt?: number;
}

class InMemoryStore {
  private storage: Map<string, StorageValue> = new Map();
  private sets: Map<string, Set<string>> = new Map();

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.storage.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Set a value with optional expiration (in seconds)
   */
  async set(key: string, value: string): Promise<void> {
    this.storage.set(key, { value });
  }

  /**
   * Set a value with expiration time (in seconds)
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    const expiresAt = Date.now() + (seconds * 1000);
    this.storage.set(key, { value, expiresAt });
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    this.storage.delete(key);
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    // Simple pattern matching for Redis-like glob patterns
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matchingKeys: string[] = [];
    
    for (const key of this.storage.keys()) {
      if (regex.test(key)) {
        matchingKeys.push(key);
      }
    }
    
    return matchingKeys;
  }

  /**
   * Add a member to a set
   */
  async sadd(key: string, member: string): Promise<void> {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key)!.add(member);
  }

  /**
   * Remove a member from a set
   */
  async srem(key: string, member: string): Promise<void> {
    const set = this.sets.get(key);
    if (set) {
      set.delete(member);
      if (set.size === 0) {
        this.sets.delete(key);
      }
    }
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  /**
   * Clear all expired items
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.storage.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup of expired items
   */
  startCleanup(intervalMs: number = 60000): void {
    setInterval(() => this.cleanupExpired(), intervalMs);
  }

  /**
   * Get storage stats for monitoring
   */
  getStats() {
    return {
      keysCount: this.storage.size,
      setsCount: this.sets.size,
    };
  }
}

// Singleton instance
let storeInstance: InMemoryStore | null = null;

export function getInMemoryStore(): InMemoryStore {
  if (!storeInstance) {
    storeInstance = new InMemoryStore();
    storeInstance.startCleanup();
    console.log('In-memory store initialized');
  }
  return storeInstance;
}
