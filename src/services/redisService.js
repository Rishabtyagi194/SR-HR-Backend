// src/services/redisService.js
import { createClient } from 'redis';

const redisUrl = `redis://${process.env.REDIS_HOST}:6379` || 'redis://127.0.0.1:6379';

// Create a Redis Client
const redisClient = createClient({ url: redisUrl });

// Connection Event Listeners
redisClient.on('error', (err) => {
  console.error('Redis error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis:', redisUrl);
});

// Connect to Redis
await redisClient.connect();

// Key where we store all search keywords
const KEYWORDS_ZSET_KEY = 'search_keywords';

/**
 * Save a searched keyword in Redis (for autocomplete / analytics)
 * Uses a Sorted Set so we can do prefix search with ZRANGEBYLEX.
 */
export const saveKeyword = async (keyword) => {
  if (!keyword) return;

  const value = keyword.toLowerCase().trim();
  if (!value) return;

  try {
    // Score is 0 because we only care about lexicographical range
    // zAdd - insert into Sorted Set
    await redisClient.zAdd(KEYWORDS_ZSET_KEY, {
      score: 0,
      value,
    });
  } catch (err) {
    console.error('Error saving keyword to Redis:', err.message);
  }
};

/**
 * Get keyword suggestions that start with a given prefix.
 * Uses ZRANGEBYLEX for very fast autocomplete.
 */
// export const getKeywordSuggestions = async (keyword, limit = 10) => {
//   if (!keyword) return [];

//   const value = keyword.toLowerCase().trim();
//   if (!value) return [];

//   try {

//     const allKeywords = await redisClient.zRange(KEYWORDS_ZSET_KEY, 0, -1);
//     // const matched = allKeywords.filter((k) => k.includes(keyword.toLowerCase()));
//     const matched = allKeywords.filter((k) =>
//   k.toLowerCase().includes(value)
// );

//     return matched.slice(0, 10);

//     // return results;
//   } catch (err) {
//     console.error('Error getting keyword suggestions from Redis:', err.message);
//     return [];
//   }
// };

export const getKeywordSuggestions = async (keyword, limit = 10) => {
  
  if (!keyword) return [];

  const value = keyword.toLowerCase().trim();

  try {
    const allKeywords = await redisClient.zRange(KEYWORDS_ZSET_KEY, 0, -1);
    return allKeywords
      .filter(k => k.toLowerCase().includes(value))
      .slice(0, limit);
  } catch (err) {
    console.error('Redis error:', err.message);
    return [];
  }
};

export default redisClient;
