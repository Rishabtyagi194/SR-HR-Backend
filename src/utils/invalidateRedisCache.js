import { getRedisClient } from '../config/redisClient.js';
import { scanKeys } from './scanKeys.js';

const redis = getRedisClient();

export const invalidateJobCache = async (companyId) => {
  // Use SCAN instead of KEYS
  const allKeys = [...(await scanKeys(redis, `jobs:list:all:*`)), ...(await scanKeys(redis, `jobs:list:${companyId}:*`))];

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
    console.log(` Cache invalidated (${allKeys.length} keys)`);
  } else {
    console.log(' No matching cache keys found to invalidate.');
  }
};
