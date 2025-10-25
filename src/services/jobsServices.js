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
