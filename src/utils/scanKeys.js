export async function scanKeys(redis, pattern) {
  let cursor = '0';
  let keys = [];

  do {
    const [newCursor, foundKeys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 500);
    cursor = newCursor;
    keys.push(...foundKeys);
  } while (cursor !== '0');

  return keys;
}

// Why This Is Better

// SCAN iterates through Redis keys without blocking (unlike KEYS).

// It’s safe in production, even with 100k+ keys.

// Using 'COUNT', 100 means it fetches 100 keys per iteration — you can increase to 500 or 1000 for faster scans if needed.
