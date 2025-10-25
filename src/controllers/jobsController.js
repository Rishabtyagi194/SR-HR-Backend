import jobsServices from '../services/jobsServices.js';

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

    const result = await jobsServices.createJobs(jobPayload);

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

    const { jobs, total } = await jobsServices.listAllJobs(page, limit);

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
    const result = await jobsServices.JobById(id);

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

    const result = await jobsServices.updateJob(id, updateData);

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

    const deleted = await jobsServices.deleteJob(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('deleteJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
