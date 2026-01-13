import { getRedisClient } from '../config/redisClient.js';
import { scanKeys } from './scanKeys.js';

const redis = getRedisClient();

/**
 * Invalidate ALL Hot Vacancy job caches
 * Call this when:
 * - Job is created
 * - Job is updated
 * - Job status changes
 * - is_consultant_Job_Active changes
 */
export const invalidateJobCache = async () => {
  const patterns = [
    'public:jobs:*',
    'dashboard:jobs:*'
  ];

  let allKeys = [];

  for (const pattern of patterns) {
    const keys = await scanKeys(redis, pattern);
    allKeys.push(...keys);
  }

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
    console.log(`HotVacancy cache invalidated (${allKeys.length} keys)`);
  } else {
    console.log('No HotVacancy cache keys found.');
  }
};


export const invalidateInternshipCache = async () => {
  const patterns = [
    'public:internships:*',
    'dashboard:internships:*'
  ];

  let allKeys = [];

  for (const pattern of patterns) {
    const keys = await scanKeys(redis, pattern);
    allKeys.push(...keys);
  }

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
    console.log(`Internship cache invalidated (${allKeys.length} keys)`);
  } else {
    console.log('No Internship cache keys found.');
  }
};
