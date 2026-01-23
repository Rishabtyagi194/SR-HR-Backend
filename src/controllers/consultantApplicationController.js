import { ALLOWED_RESUME_STATUSES } from '../constants/resumeStatus.js';
import { updateResumeStatus } from '../queries/consultantApplicationQueries.js';
import {
  getConsultantUploadedJobs,
  getJobByJobIdAndOrgId,
  listApplicationsUploadedByConsultant,
} from '../services/consultantApplicationService.js';

// get all resume list uploaded by consultant
export const getAllApplicationsUploadedByConsultant = async (req, res) => {
  try {
    const employerOrgId = Number(req.user.organisation_id);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { applications, total } = await listApplicationsUploadedByConsultant({
      employerOrgId,
      limit,
      offset,
    });

    return res.status(200).json({
      message: 'Consultant applications fetched successfully',
      totalApplications: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      applications,
    });
  } catch (error) {
    console.error('getAllApplicationsUploadedByConsultant error:', error);
    return res.status(500).json({
      message: 'Failed to fetch consultant applications',
    });
  }
};

// get all application applied for consultant
export const getMyUploadedJobsController = async (req, res) => {
  try {
    const consultantUserId = req.user.id;

    const jobs = await getConsultantUploadedJobs(consultantUserId);

    res.status(200).json({
      message: 'Consultant uploaded jobs fetched successfully',
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Consultant uploaded jobs error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// get job by job id and org id
export const getJobByJobIdAndOrgIdController = async (req, res) => {
  try {
    const { job_ref_id, employer_org_id } = req.params;

    const job = await getJobByJobIdAndOrgId(Number(job_ref_id), Number(employer_org_id));

    if (!job) {
      return res.status(404).json({
        message: 'Job not found for this organisation',
      });
    }

    res.status(200).json({
      message: 'Job details fetched successfully',
      job,
    });
  } catch (error) {
    console.error('Get job by jobId & orgId error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};



// update the status of resume by employer
export const updateResumeStatusController = async (req, res) => {
  try {
    const employerUserId = req.user.id;
    const { application_id, resume_id, status } = req.body;

    console.log("application_id, resume_id, status", application_id, resume_id, status);
     
    if (!application_id || !resume_id || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!ALLOWED_RESUME_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
        allowed: ALLOWED_RESUME_STATUSES
      });
    }

    const updatedResume = await updateResumeStatus(
      employerUserId,
      application_id,
      resume_id,
      status
    );

    console.log("updatedResume", updatedResume);
    

    if (!updatedResume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({
      message: 'Resume status updated successfully',
      resume: updatedResume
    });
  } catch (error) {
    console.error('Update resume status error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


