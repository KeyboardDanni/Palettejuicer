import { expect, test } from "vitest";
import { MruCache } from "../model/MruCache";

const QUEUE_SIZES = [2, 4, 8, 32, 101, 256, 1024];
const BAD_QUEUE_SIZES = [
  0,
  1,
  16777216,
  Number.MAX_SAFE_INTEGER,
  -0,
  -1,
  -16,
  Number.MIN_SAFE_INTEGER,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  NaN,
];

function transformValue(input: string): string {
  return input + "!";
}

test("constructs an empty MruCache", () => {
  const mruCache = new MruCache<string, string>();

  expect(mruCache.length).toBe(0);
});

test.each(BAD_QUEUE_SIZES)("throws on invalid max queue size (%i)", (maxQueueSize) => {
  expect(() => {
    new MruCache<string, string>(maxQueueSize);
  }).toThrow();
});

test("stores and retrieves a cached value", () => {
  const mruCache = new MruCache<string, string>();

  expect(mruCache.lookup("key")).toBeUndefined();

  mruCache.store("key", "value");

  expect(mruCache.lookup("key")).toBe("value");
  expect(mruCache.length).toBe(1);

  mruCache.store("key", "newValue");

  expect(mruCache.lookup("key")).toBe("newValue");
  expect(mruCache.length).toBe(1);
  expect(mruCache.lookup("key2")).toBeUndefined();

  mruCache.store("key2", "newValue2");

  expect(mruCache.lookup("key")).toBe("newValue");
  expect(mruCache.lookup("key2")).toBe("newValue2");
  expect(mruCache.length).toBe(2);

  mruCache.store("key", "newValue3");

  expect(mruCache.lookup("key")).toBe("newValue3");
  expect(mruCache.lookup("key2")).toBe("newValue2");
  expect(mruCache.length).toBe(2);
});

test.each(QUEUE_SIZES)("removes old entries from the cache (%i)", (maxQueueSize) => {
  const mruCache = new MruCache<string, string>(maxQueueSize);
  const keys = new Array(maxQueueSize * 2).fill(null).map((_, i) => i.toString());
  const values = keys.map((key) => transformValue(key));

  for (let i = 0; i < maxQueueSize; i++) {
    mruCache.store(keys[i], values[i]);
  }

  expect(mruCache.length).toBe(maxQueueSize);

  for (let i = 0; i < maxQueueSize; i++) {
    expect(mruCache.lookup(keys[i])).toBe(values[i]);
  }

  for (let i = 0; i < maxQueueSize; i++) {
    const j = i + maxQueueSize;

    mruCache.store(keys[j], values[j]);

    expect(mruCache.length).toBe(maxQueueSize);
    expect(mruCache.lookup(keys[i])).toBeUndefined();
    expect(mruCache.lookup(keys[j])).toBe(values[j]);
  }

  for (let i = 0; i < maxQueueSize / 2; i++) {
    const j = i + maxQueueSize;

    mruCache.store(keys[j], values[j]);

    expect(mruCache.length).toBe(maxQueueSize);
    expect(mruCache.lookup(keys[i])).toBeUndefined();
    expect(mruCache.lookup(keys[j])).toBe(values[j]);
  }

  for (let i = maxQueueSize / 2; i < maxQueueSize; i++) {
    const i2 = i - maxQueueSize / 2;
    const j = i2 + maxQueueSize;

    mruCache.store(keys[i2], values[i2]);

    expect(mruCache.length).toBe(maxQueueSize);
    expect(mruCache.lookup(keys[j])).toBeUndefined();
    expect(mruCache.lookup(keys[i2])).toBe(values[i2]);
  }
});
