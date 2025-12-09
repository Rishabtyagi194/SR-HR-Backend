import jobApplicationService from '../services/jobApplicationService.js';

// Apply on a particular job
export const applyForJobController = async (req, res) => {
  const { jobId, category } = req.params; // read category here
  const user = req.user;
  const { answers } = req.body;

  try {
    const result = await jobApplicationService.applyForJob(jobId, user.id, answers, category);

    if (result.alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(201).json({
      success: true,
      message: `Application submitted successfully for ${result.category} job.`,
      category: result.category,
      applicationId: result.applicationId,
    });
  } catch (error) {
    console.error('Error in applyForJobController:', error);

    if (error.message === 'Job not found') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer available.',
      });
    }

    if (error.message === 'You have already applied for this job') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while applying for the job.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// get a response/application for a  particular job
export const getApplicationsForJob = async (req, res) => {
  const { jobId, category } = req.params;

  try {
    const applications = await jobApplicationService.getApplicationsForJob(jobId, category);

    res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error in getApplicationsForJob:', error);

    if (error.message === 'Job not found') {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching applications.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

//  get app applications/response for a particular company/employer
export const getAllCompanyApplications = async (req, res) => {
  try {
    const user = req.user;

    if (!user.company_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employer. Missing company information.',
      });
    }

    const applications = await jobApplicationService.getAllCompanyApplications(user.company_id);

    res.status(200).json({
      success: true,
      message: 'All applications/response fetched successfully within a company',
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error in getAllCompanyApplications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company applications.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// get all applied job for a particular user
export const getUserAllAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const jobs = await jobApplicationService.getUserAllAppliedJobs(userId);

    res.status(200).json({
      success: true,
      message: 'Applied jobs fetched successfully',
      total: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Error in getUserAllAppliedJobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applied jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
