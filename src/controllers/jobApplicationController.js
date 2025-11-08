import jobApplicationService from '../services/jobApplicationService.js';

export const applyForJobController = async (req, res) => {
  const { jobId } = req.params;
  const user = req.user;
  const { answers } = req.body;

  try {
    const result = await jobApplicationService.applyForJob(jobId, user.id, answers);

    // Duplicate application
    if (result.alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.applicationId,
    });
  } catch (error) {
    console.error('❌ Error in applyForJobController:', error);

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

export const getApplicationsForJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const applications = await jobApplicationService.getApplicationsForJob(jobId);

    res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    console.error('❌ Error in getApplicationsForJob:', error);

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
