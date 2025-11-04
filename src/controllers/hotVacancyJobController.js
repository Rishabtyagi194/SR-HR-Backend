import hotVacancyJobsServices from '../services/hotVacancyJobsServices.js';

export const createJobsController = async (req, res) => {
  try {
    const user = req.user;

    const {
      jobTitle,
      employmentType,
      skills,
      CompanyIndustry,
      workMode,
      jobLocation,
      willingToRelocate,
      locality,
      experinceFrom,
      experinceTo,
      salaryRangeFrom,
      salaryRangeTo,
      qualification,
      jobDescription,
      AboutCompany,

      // Walk-in details fields
      include_walk_in_details,
      walk_in_start_date,
      duration_days,
      walk_in_start_time,
      walk_in_end_time,
      contact_person,
      venue,
      google_maps_url,
      contact_number,

      // Questions field
      questions,
    } = req.body;

    // base payload
    let jobPayload = {
      company_id: user.company_id,
      jobTitle,
      employmentType,
      skills,
      CompanyIndustry,
      workMode,
      jobLocation,
      willingToRelocate,
      locality,
      experinceFrom,
      experinceTo,
      salaryRangeFrom,
      salaryRangeTo,
      qualification,
      jobDescription,
      AboutCompany,

      // Walk-in details fields
      include_walk_in_details,
      walk_in_start_date,
      duration_days,
      walk_in_start_time,
      walk_in_end_time,
      contact_person,
      venue,
      google_maps_url,
      contact_number,

      // Questions field
      questions,
    };

    // role-based assignment
    if (user.role === 'employer_admin') {
      jobPayload.employer_id = user.id;
      jobPayload.staff_id = null;
    } else if (user.role === 'employer_staff') {
      jobPayload.staff_id = user.id;
      jobPayload.employer_id = null;
    } else {
      return res.status(403).json({ message: 'unauthorized role to create jobs' });
    }

    const result = await hotVacancyJobsServices.createJobs(jobPayload);

    return res.status(201).json({
      message: 'Successfully posted job',
      job: result,
    });
  } catch (error) {
    console.error('createJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const ListAllJobsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { jobs, total } = await hotVacancyJobsServices.listAllJobs(page, limit);

    return res.status(200).json({
      message: 'Jobs fetched successfully',
      totalJobs: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      AllJobs: jobs,
    });
  } catch (error) {
    console.error('ListAllJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getJobsByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await hotVacancyJobsServices.getJobById(id);

    if (!result) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({
      message: 'Job fetched successfully',
      job: result,
    });
  } catch (error) {
    console.error('getJobsByIdController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateJobsController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // fields to update

    const result = await hotVacancyJobsServices.updateJob(id, updateData);

    if (!result) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({
      message: 'Job updated successfully',
      job: result,
    });
  } catch (error) {
    console.error('updateJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteJobsController = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await hotVacancyJobsServices.deleteJob(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('deleteJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
