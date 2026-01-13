// services/jobsServices.js
import { getRedisClient } from '../config/redisClient.js';
import internshipQueries from '../queries/internshipJobQueries.js';
import { invalidateInternshipCache } from '../utils/invalidateRedisCache.js';
const redis = getRedisClient();

class internshipService {
  async createInternship(jobsData) {
    const internship = await internshipQueries.create(jobsData);

    await invalidateInternshipCache(jobsData.organisation_id); // invalidate all list caches
    return internship;
  }

  async listDashboardInternships(page, limit, role, organisationId, userId) {
    const cacheKey = role.endsWith('_staff')
      ? `dashboard:internships:${role}:${userId}:${page}:${limit}`
      : `dashboard:internships:${role}:${organisationId}:${page}:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await internshipQueries.getDashboardInternships(page, limit, role, organisationId, userId);

    await redis.set(cacheKey, JSON.stringify(data), 'EX', 180);
    return data;
  }

  async listPublicInternships(page, limit, role) {
    const cacheKey = `public:internships:${role}:${page}:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await internshipQueries.getPublicInternships(page, limit, role);

    await redis.set(cacheKey, JSON.stringify(data), 'EX', 180);
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

    await redis.set(cacheKey, JSON.stringify(job), 'EX', 180); // 5 min TTL
    return job;
  }

  //  Update a job and invalidate caches
  async updateInternship(id, updateData) {
    const job = await internshipQueries.updateInternshipById(id, updateData);
    if (job) await invalidateInternshipCache(job.organisation_id, id);
    return job;
  }

  //  Delete a job and invalidate caches
  async deleteInternship(id) {
    const job = await internshipQueries.getInternshipById(id);
    const deleted = await internshipQueries.deleteInternshipById(id);
    if (deleted && job) await invalidateInternshipCache(job.organisation_id, id);
    return deleted;
  }
}
export default new internshipService();
