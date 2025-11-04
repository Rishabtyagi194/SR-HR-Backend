// controllers/jobApplicationController.js
import jobApplicationService from '../services/jobApplicationService.js';

export const applyForJobController = async (req, res) => {
  const { jobId } = req.params;
  const user = req.user;
  const { answers } = req.body;

  //   console.log('user:', user);

  try {
    const result = await jobApplicationService.applyForJob(jobId, user.id, answers);
    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: result.applicationId,
    });
  } catch (error) {
    console.error('Error in applyForJob:', error);
    res.status(500).json({
      message: 'Failed to apply for job',
      error: error.message,
    });
  }
};

export const getApplicationsForJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const applications = await jobApplicationService.getApplicationsForJob(jobId);
    res.status(200).json({
      message: 'Applications fetched successfully',
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error in getApplicationsForJob:', error);
    res.status(500).json({
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};
