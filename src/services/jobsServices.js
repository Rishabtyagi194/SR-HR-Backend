// // services/jobsServices.js
// import JobPostQueries from '../queries/JobPostQueries.js';
// import { getRedisClient } from '../config/redisClient.js';

// const redis = getRedisClient();

// class JobsService {
//   /**
//    * Fetch all jobs (public / company / staff)
//    * Uses Redis cache to reduce DB load
//    */
//   async listAllJobs(filters, user) {
//     const cacheKey = this._getCacheKey(filters, user);

//     // 1️⃣ Try Redis
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       console.log(`🔁 Cache hit for key: ${cacheKey}`);
//       return JSON.parse(cached);
//     }

//     // 2️⃣ Fetch from DB
//     console.log(`💾 Cache miss → Fetching from DB`);
//     const data = await JobPostQueries.getAllJobs(filters, user);

//     // 3️⃣ Store in Redis
//     await redis.set(cacheKey, JSON.stringify(data), 'EX', 60); // TTL 60s

//     return data;
//   }

//   /**
//    * Invalidate caches related to a job or company
//    */
//   async invalidateJobCache(jobId, companyId) {
//     // Delete individual job cache
//     if (jobId) await redis.del(`job:${jobId}`);

//     // Increment company cache version to invalidate feed caches
//     if (companyId) await redis.incr(`companyJobsVersion:${companyId}`);
//   }

//   /**
//    * Fetch single job (with Redis cache)
//    */
//   async getJobById(jobId) {
//     const cacheKey = `job:${jobId}`;

//     // 1️⃣ Try cache
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       console.log(`🔁 Cache hit job:${jobId}`);
//       return JSON.parse(cached);
//     }

//     // 2️⃣ Fetch from DB
//     const job = await JobPostQueries.getJobById(jobId);
//     if (!job) return null;

//     // 3️⃣ Cache result
//     await redis.set(cacheKey, JSON.stringify(job), 'EX', 300); // 5 minutes TTL

//     return job;
//   }

//   /**
//    * After create/update/delete job
//    * call this to invalidate caches automatically
//    */
//   async handleJobMutation(jobId, companyId) {
//     await this.invalidateJobCache(jobId, companyId);
//   }

//   /**
//    * Internal helper for consistent cache key generation
//    */
//   _getCacheKey(filters, user) {
//     const base = JSON.stringify({
//       filters,
//       userId: user?.id || 'public',
//       role: user?.role || 'guest',
//     });
//     const hash = Buffer.from(base).toString('base64');
//     const company = filters.company_id || 'global';
//     return `jobs:feed:${company}:${hash}`;
//   }
// }

// export default new JobsService();

import JobPostQueries from '../queries/JobPostQueries.js';

class jobService {
  async createJobs(jobsData) {
    const job = await JobPostQueries.create(jobsData);
    return job;
  }

  async listAllJobs(page, limit) {
    return await JobPostQueries.getAllJobs(page, limit);
  }

  async JobById(id) {
    const job = await JobPostQueries.getJobById(id);
    return job;
  }

  async updateJob(id, updateData) {
    const job = await JobPostQueries.updateJobById(id, updateData);
    return job;
  }

  async deleteJob(id) {
    return await JobPostQueries.deleteJobById(id);
  }
}

export default new jobService();
