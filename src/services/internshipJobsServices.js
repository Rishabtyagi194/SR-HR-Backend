// services/jobsServices.js
import { getRedisClient } from '../config/redisClient.js';
import internshipQueries from '../queries/internshipJobQueries.js';
import { invalidateJobCache } from '../utils/invalidateRedisCache.js';
const redis = getRedisClient();

class internshipService {
  async createInternship(jobsData) {
    const internship = await internshipQueries.create(jobsData);

    await invalidateJobCache(jobsData.company_id); // invalidate all list caches
    return internship;
  }

  // Paginated list of all jobs (with Redis cache)
  async listAllInternship(page = 1, limit = 10, companyId = null) {
    const cacheKey = companyId ? `internships:list:${companyId}:${page}:${limit}` : `internships:list:all:${page}:${limit}`;
    // console.log('cacheKey', cacheKey);

    const cached = await redis.get(cacheKey);
    // console.log('cached', cached);

    if (cached) {
      console.log(`Redis cache hit → ${cacheKey}`);
      return JSON.parse(cached); // Returns it immediately, without querying the database.
    }

    console.log(`Cache miss → fetching from DB...`);
    const data = await internshipQueries.allInternship(page, limit, companyId);

    // Store in Redis with short TTL (5 min => 5 * 60s = 300)
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 600);

    return data;
  }

  //  Fetch single job with caching
  async getinternshipById(jobId) {
    const cacheKey = `internships:${jobId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache hit for job:${jobId}`);
      return JSON.parse(cached);
    }

    const job = await internshipQueries.getInternshipById(jobId);
    if (!job) return null;

    await redis.set(cacheKey, JSON.stringify(job), 'EX', 300); // 5 min TTL
    return job;
  }

  //  Update a job and invalidate caches
  async updateInternship(id, updateData) {
    const job = await internshipQueries.updateInternshipById(id, updateData);
    if (job) await invalidateJobCache(job.company_id, id);
    return job;
  }

  //  Delete a job and invalidate caches
  async deleteInternship(id) {
    const job = await internshipQueries.getInternshipById(id);
    const deleted = await internshipQueries.deleteInternshipById(id);
    if (deleted && job) await invalidateJobCache(job.company_id, id);
    return deleted;
  }
}
export default new internshipService();
