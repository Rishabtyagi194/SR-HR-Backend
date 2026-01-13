// services/jobsServices.js
import JobPostQueries from '../queries/hotVacancyJobsQueries.js';
import { getRedisClient } from '../config/redisClient.js';
import { invalidateJobCache } from '../utils/invalidateRedisCache.js';

const redis = getRedisClient();

class JobsService {
  async createJobs(jobsData) {
    // console.log('jobsData', jobsData);

    const job = await JobPostQueries.create(jobsData);

    await invalidateJobCache(jobsData.organisation_id); // invalidate all list caches
    return job;
  }

  async listDashboardJobs(page, limit, role, organisationId, userId) {
    const cacheKey = role.endsWith('_staff')
      ? `dashboard:jobs:${role}:${userId}:${page}:${limit}`
      : `dashboard:jobs:${role}:${organisationId}:${page}:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await JobPostQueries.getDashboardJobs(page, limit, role, organisationId, userId);

    await redis.set(cacheKey, JSON.stringify(data), 'EX', 180);
    return data;
  }

  // Paginated list of all jobs (with Redis cache)
  // async listAllJobs(page = 1, limit = 10, organisationId = null, role) {
  //   const cacheKey = organisationId
  //     ? `hotvacancy:list:${role}:${organisationId}:${page}:${limit}`
  //     : `hotvacancy:list:${role}:all:${page}:${limit}`;

  //   const cached = await redis.get(cacheKey);

  //   if (cached) {
  //     console.log(`Redis cache hit → ${cacheKey}`);
  //     return JSON.parse(cached);
  //   }

  //   console.log(` Cache miss → fetching from DB...`);
  //   const data = await JobPostQueries.getAllJobs(page, limit, organisationId, role);

  //   // Store in Redis
  //   await redis.set(cacheKey, JSON.stringify(data), 'EX', 180); // 5 min

  //   return data;
  // }
  async listPublicJobs(page, limit, role) {
    const cacheKey = `public:jobs:${role}:${page}:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await JobPostQueries.getPublicJobs(page, limit, role);

    await redis.set(cacheKey, JSON.stringify(data), 'EX', 180);
    return data;
  }

  //  Fetch single job with caching
  async getJobById(jobId) {
    const cacheKey = `hotvacancy:${jobId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(` Cache hit for job:${jobId}`);
      return JSON.parse(cached);
    }

    const job = await JobPostQueries.getJobById(jobId);
    if (!job) return null;

    await redis.set(cacheKey, JSON.stringify(job), 'EX', 180); // 5 min TTL
    return job;
  }

  //  Update a job and invalidate caches
  async updateJob(id, updateData) {
    const job = await JobPostQueries.updateJobById(id, updateData);
    if (job) await invalidateJobCache(job.organisation_id, id);
    return job;
  }

  //  Delete a job and invalidate caches
  async deleteJob(id) {
    const job = await JobPostQueries.getJobById(id);
    const deleted = await JobPostQueries.deleteJobById(id);
    if (deleted && job) await invalidateJobCache(job.organisation_id, id);
    return deleted;
  }
}
export default new JobsService();

// import JobPostQueries from '../queries/JobPostQueries.js';

// class jobService {
//   async createJobs(jobsData) {
//     const job = await JobPostQueries.create(jobsData);
//     return job;
//   }

//   async listAllJobs(page, limit) {
//     return await JobPostQueries.getAllJobs(page, limit);
//   }

//   async JobById(id) {
//     const job = await JobPostQueries.getJobById(id);
//     return job;
//   }

//   async updateJob(id, updateData) {
//     const job = await JobPostQueries.updateJobById(id, updateData);
//     return job;
//   }

//   async deleteJob(id) {
//     return await JobPostQueries.deleteJobById(id);
//   }
// }

// export default new jobService();
