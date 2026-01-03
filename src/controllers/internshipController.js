import { getReadPool } from '../config/database.js';
import internshipJobQueries from '../queries/internshipJobQueries.js';
import internshipJobsServices from '../services/internshipJobsServices.js';

export const createInternshipJobsController = async (req, res) => {
  try {
    const user = req.user;
    // console.log('REQ.USER', req.user);

    const {
      internshipTitle,
      employmentType,
      duration,
      internshipStartDate,
      OfferStipend,
      workMode,
      intershipLocation,
      willingToRelocate,
      CompanyIndustry,
      perksAndBenefit,
      noOfVacancies,
      skills,
      qualification,
      videoProfile,
      lastDateToApply,
      jobDescription,
      collabrateWithTeam,
      receivedResponseOverMail,
      addResponseCode,
      AboutCompany,
      postedBy,
      Status,
    } = req.body;

    // base payload
    let jobPayload = {
      company_id: user.company_id,
      internshipTitle,
      employmentType,
      duration,
      internshipStartDate,
      OfferStipend,
      workMode,
      intershipLocation,
      willingToRelocate,
      CompanyIndustry,
      perksAndBenefit,
      noOfVacancies,
      skills,
      qualification,
      videoProfile,
      lastDateToApply,
      jobDescription,
      collabrateWithTeam,
      receivedResponseOverMail,
      addResponseCode,
      AboutCompany,
      postedBy: user.email,
      Status,
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

    const result = await internshipJobsServices.createInternship(jobPayload);

    return res.status(201).json({
      message: 'Successfully posted a Internship',
      job: result,
    });
  } catch (error) {
    console.error('create internship Controller error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const ListAllInternshipJobsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // If company_id is passed → dashboard view
    // If not → client view (all jobs)
    const companyId = req.user?.company_id || req.query.company_id || null;

    const { jobs, total } = await internshipJobsServices.listAllInternship(page, limit, companyId);

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
export const getEmployerInternshipController = async (req, res) => {
  try {
    const user = req.user;
    if (!user.company_id) return res.status(400).json({ message: 'Missing company id for employer' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { jobs, total } = await internshipJobsServices.listAllInternship(page, limit, user.company_id, true);

    res.status(200).json({
      message: 'Internship fetched successfully',
      total,
      jobs, // includes total_responses count for each job
    });
  } catch (error) {
    console.error('getEmployerInternshipController error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// When employer clicks a specific job → show full responses + user profiles
export const getSingleInternshipWithApplicationsController = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = req.user; // from Authenticate middleware

    //First fetch the job company_id for access control
    const [internshipCheck] = await getReadPool().query(`SELECT company_id FROM InternshipJobs WHERE job_id = ?`, [jobId]);

    if (!internshipCheck.length) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const jobCompanyId = internshipCheck[0].company_id;

    // Allow only if the employer belongs to the same company
    if (user.role.startsWith('employer') && user.company_id !== jobCompanyId) {
      return res.status(403).json({
        message: 'Unauthorized: you do not have access to this job',
      });
    }

    // Now fetch job + applications (since access is verified)
    const job = await internshipJobQueries.getInternshipWithApplications(jobId, user.company_id);

    if (!job) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.status(200).json({
      message: 'Internship details with applications fetched successfully',
      job,
    });
  } catch (error) {
    console.error('getSingleInternshipWithApplicationsController error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getInternshipJobsByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await internshipJobsServices.getinternshipById(id);

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
export const updateInternshipJobsController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // fields to update

    const result = await internshipJobsServices.updateInternship(id, updateData);

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

export const deleteInternshipJobsController = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await internshipJobsServices.deleteInternship(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('deleteJobsController error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
