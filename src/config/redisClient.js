// config/redisClient.js
import Redis from 'ioredis';

let redisClient;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      // Add a better retry strategy to handle connection issues
      retryStrategy(times) {
        const delay = Math.min(times * 200, 3000);
        console.log(`Redis reconnect attempt #${times}, retrying in ${delay}ms`);
        return delay;
      },
      connectTimeout: 10000, // 10 seconds timeout
      lazyConnect: false, // connect immediately
    });

    redisClient.on('connect', () => console.log(' Redis connected successfully'));
    redisClient.on('error', (err) => console.error(' Redis error:', err));
    redisClient.on('reconnecting', () => console.log(' Redis reconnecting...'));
  }

  return redisClient;
};
