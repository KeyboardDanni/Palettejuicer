export const DEFAULT_QUEUE_MAX = 8192;
export const MAX_QUEUE_MAX = 32768;

export class MruCache<K, V> {
  private map = new Map<K, V>();
  private queue: K[] = [];
  readonly maxQueueSize;

  constructor(maxQueueSize: number = DEFAULT_QUEUE_MAX) {
    if (maxQueueSize < 2 || maxQueueSize > MAX_QUEUE_MAX || Number.isNaN(maxQueueSize)) {
      throw new Error("Bad max queue size");
    }

    this.maxQueueSize = maxQueueSize;
  }

  lookup(key: K): V | undefined {
    return this.map.get(key);
  }

  store(key: K, value: V) {
    if (!this.map.has(key)) {
      if (this.queue.length >= this.maxQueueSize) {
        const oldKey = this.queue.shift() as K;
        this.map.delete(oldKey);
      }

      this.queue.push(key);
    }

    this.map.set(key, value);
  }

  get length() {
    return this.queue.length;
  }
}
