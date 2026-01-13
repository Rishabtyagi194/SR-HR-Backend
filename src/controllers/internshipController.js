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
      is_consultant_Job_Active,
      Status,
    } = req.body;

    // base payload
    let jobPayload = {
      organisation_id: user.organisation_id,
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

      posted_by_email: user.email,
      is_consultant_Job_Active,
      Status,
    };

    // role-based assignment

    if (user.role === 'employer_admin') {
      jobPayload.postedBy = 'company';
      jobPayload.organisation_id = user.organisation_id; // organisations.id
      jobPayload.employer_id = user.id;
      jobPayload.staff_id = null;
    } else if (user.role === 'employer_staff') {
      jobPayload.postedBy = 'company';
      jobPayload.organisation_id = user.organisation_id;
      jobPayload.staff_id = user.id;
      jobPayload.employer_id = null;
    } else if (user.role === 'consultant_admin') {
      jobPayload.postedBy = 'consultant';
      jobPayload.organisation_id = user.organisation_id;
      jobPayload.employer_id = user.id;
      jobPayload.staff_id = null;
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

// list all jobs for employer
export const getEmployerInternshipController = async (req, res) => {
  try {
    const { role, organisation_id, id: userId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { jobs, total } = await internshipJobsServices.listDashboardInternships(page, limit, role, organisation_id, userId);

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

export const ListAllInternshipJobsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.user.role;
    
    const { jobs, total } = await internshipJobsServices.listPublicInternships(page, limit, role);

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

// When employer clicks a specific job → show full responses + user profiles
export const getSingleInternshipWithApplicationsController = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = req.user; // from Authenticate middleware

    //First fetch the job organisation_id for access control
    const [internshipCheck] = await getReadPool().query(`SELECT organisation_id FROM InternshipJobs WHERE job_id = ?`, [jobId]);

    if (!internshipCheck.length) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const jobCompanyId = internshipCheck[0].organisation_id;

    // Allow only if the employer belongs to the same company
    if (user.role.startsWith('employer') && user.organisation_id !== jobCompanyId) {
      return res.status(403).json({
        message: 'Unauthorized: you do not have access to this job',
      });
    }

    // Now fetch job + applications (since access is verified)
    const job = await internshipJobQueries.getInternshipWithApplications(jobId, user.organisation_id);

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
