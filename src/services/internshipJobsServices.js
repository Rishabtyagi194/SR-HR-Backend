// services/jobsServices.js
import internshipQueries from '../queries/internshipJobQueries.js';
import { getRedisClient } from '../config/redisClient.js';

const redis = getRedisClient();

class internshipService {
  async createInternship(jobsData) {
    const internship = await internshipQueries.create(jobsData);
    // Invalidate relevant caches after creation
    await this.invalidateJobCache(null, jobsData.company_id);
    return internship;
  }

  // Paginated list of all jobs (with Redis cache)
  async listAllInternship(page = 1, limit = 10) {
    const cacheKey = `jobs:list:${page}:${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Redis cache hit → ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(` Cache miss → fetching from DB...`);
    const data = await internshipQueries.allInternship(page, limit);

    // Store in Redis with short TTL (60s)
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 60);

    return data;
  }

  //  Fetch single job with caching
  async getinternshipById(jobId) {
    const cacheKey = `job:${jobId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(` Cache hit for job:${jobId}`);
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
    if (job) await this.invalidateJobCache(id, job.company_id);
    return job;
  }

  //  Delete a job and invalidate caches
  async deleteInternship(id) {
    const job = await internshipQueries.getInternshipById(id);
    const deleted = await internshipQueries.deleteInternshipById(id);
    if (deleted && job) await this.invalidateJobCache(id, job.company_id);
    return deleted;
  }

  //  Invalidate related cache keys after mutation

  async invalidateJobCache(jobId, companyId) {
    const pipeline = redis.pipeline();
    if (jobId) pipeline.del(`job:${jobId}`);

    // Invalidate list caches (e.g. first 10 pages)
    for (let p = 1; p <= 10; p++) {
      pipeline.del(`jobs:list:${p}:10`);
    }

    // If company-specific caches later:
    if (companyId) pipeline.del(`companyJobs:${companyId}`);

    await pipeline.exec();
    console.log(` Cache invalidated for job:${jobId || 'N/A'} company:${companyId || 'N/A'}`);
  }
}
export default new internshipService();
