import { getWritePool } from '../config/database.js';
import { saveKeyword as saveKeywordToRedis } from './redisService.js';

export const saveSearchKeyword = async (employerId, keyword) => {
  if (!keyword) return;
  const trimmed = keyword.toLowerCase().trim();

  await getWritePool().execute('INSERT IGNORE INTO search_keywords_history (keyword, employer_id) VALUES (?, ?)', [trimmed, employerId]);

  await saveKeywordToRedis(trimmed);
};


