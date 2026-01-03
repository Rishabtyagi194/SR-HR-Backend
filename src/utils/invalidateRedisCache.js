import { getRedisClient } from '../config/redisClient.js';
import { scanKeys } from './scanKeys.js';

const redis = getRedisClient();

export const invalidateJobCache = async (companyId) => {
  // console.log("companyId", companyId);
  
  // Use SCAN instead of KEYS
  const allKeys = [...(await scanKeys(redis, `hotvacancy:list:all:*`)), ...(await scanKeys(redis, `hotvacancy:list:${companyId}:*`))];

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
    console.log(`Hotvacancy Cache invalidated (${allKeys.length} keys)`);
  } else {
    console.log('No matching cache keys found to invalidate.');
  }
};


export const invalidateInternshipCache = async (companyId) => {
  // console.log("companyId", companyId);
  
  // Use SCAN instead of KEYS
  const allKeys = [...(await scanKeys(redis, `internships:list:all:*`)), ...(await scanKeys(redis, `internships:list:${companyId}:*`))];

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
    console.log(`Internship Cache invalidated (${allKeys.length} keys)`);
  } else {
    console.log('No matching cache keys found to invalidate.');
  }
};
