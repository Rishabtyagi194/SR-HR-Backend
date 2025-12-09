// controllers/hotVacancyJobsController.js
import { getReadPool } from '../config/database.js';
import hotVacancyJobsQueries from '../queries/hotVacancyJobsQueries.js';
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
      postedBy,
      Status,
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
      postedBy: user.email,
      Status,
    };
    // console.log('REQ.USER', req.user);

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

// list all jobs for user
export const ListAllJobsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // If company_id is passed → dashboard view
    // If not → client view (all jobs)
    const companyId = req.user?.company_id || req.query.company_id || null;

    const { jobs, total } = await hotVacancyJobsServices.listAllJobs(page, limit, companyId);

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

// list all jobs for employer
export const getEmployerJobsController = async (req, res) => {
  try {
    const user = req.user;
    if (!user.company_id) return res.status(400).json({ message: 'Missing company id for employer' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { jobs, total } = await hotVacancyJobsServices.listAllJobs(page, limit, user.company_id, true);

    res.status(200).json({
      message: 'Jobs fetched successfully',
      total,
      jobs, // includes total_responses count for each job
    });
  } catch (error) {
    console.error('getEmployerJobsController error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// When employer clicks a specific job → show full responses + user profiles
export const getSingleJobWithApplicationsController = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = req.user; // from Authenticate middleware

    //First fetch the job company_id for access control
    const [jobCheck] = await getReadPool().query(`SELECT company_id FROM HotVacancyJobs WHERE job_id = ?`, [jobId]);

    if (!jobCheck.length) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobCompanyId = jobCheck[0].company_id;

    // Allow only if the employer belongs to the same company
    if (user.role.startsWith('employer') && user.company_id !== jobCompanyId) {
      return res.status(403).json({
        message: 'Unauthorized: you do not have access to this job',
      });
    }

    // Now fetch job + applications (since access is verified)
    const job = await hotVacancyJobsQueries.getJobWithApplications(jobId, user.company_id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      message: 'Job details with applications fetched successfully',
      job,
    });
  } catch (error) {
    console.error('getSingleJobWithApplicationsController error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
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
