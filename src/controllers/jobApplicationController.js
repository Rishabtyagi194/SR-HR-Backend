import { getReadPool } from '../config/database.js';
import jobApplicationService from '../services/jobApplicationService.js';
import { getFileHash, uploadConsultantResume } from '../utils/cloudinary/consultantResumeUploader.js';

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

//  get applications/response for a particular organisation/employer
export const getAllCompanyApplications = async (req, res) => {
  try {
    const user = req.user;

    if (!user.organisation_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employer. Missing company information.',
      });
    }

    const applications = await jobApplicationService.getAllCompanyApplications(user.organisation_id);

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
// ----------------------------------------- consultant ------------------------------------------
// consultant uploads resume on a particular job
// export const uploadResumeOnJobController = async (req, res) => {
//   try {
//     const { jobId, category } = req.params;
//     const user = req.user;

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }

//     const results = [];

//     for (const file of req.files) {
//       const uploadResult = await uploadConsultantResume(file.path);

//       const data = await jobApplicationService.uploadResume({
//         user,
//         resumeUrl: uploadResult.secure_url,
//         resumePublicId: uploadResult.public_id,
//         jobId,
//         category,
//       });

//       results.push(data);
//     }

//     res.status(201).json({
//       message: 'Resumes submitted successfully',
//       count: results.length,
//       data: results,
//     });
//   } catch (error) {
//     if (error.message === 'DUPLICATE_FILE') {
//       return res.status(409).json({
//         message: 'One or more resumes were already uploaded',
//       });
//     }

//     console.error(error);
//     res.status(500).json({ message: 'Failed to upload resumes' });
//   }
// };

// export const uploadResumeOnJobController = async (req, res) => {
//   const { jobId, category } = req.params;
//   const user = req.user;

//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ message: 'No files uploaded' });
//   }

//   const uploaded = [];
//   const rejected = [];

//   for (const file of req.files) {
//     try {
//       const uploadResult = await uploadConsultantResume(file.path);

//       const data = await jobApplicationService.uploadResume({
//         user,
//         resumeUrl: uploadResult.secure_url,
//         resumePublicId: uploadResult.public_id,
//         jobId,
//         category,
//       });

//       uploaded.push(data);
//     } catch (err) {
//       if (
//         err.message === 'DUPLICATE_RESUME' ||
//         err.message === 'DUPLICATE_FILE'
//       ) {
//         rejected.push(file.originalname);
//       } else {
//         throw err;
//       }
//     }
//   }

//   return res.status(201).json({
//     message: 'Resume upload completed',
//     uploaded_count: uploaded.length,
//     rejected_count: rejected.length,
//     uploaded,
//     rejected,
//   });
// };


// export const uploadResumeOnJobController = async (req, res) => {
//   const { jobId, category: rawCategory } = req.params;
//   const user = req.user;

//   // Normalize category
//   // const rawCategory = req.params.category;
//   const category =
//     rawCategory === 'HotVacancy'
//       ? 'HotVacancy'
//       : rawCategory === 'Internship'
//       ? 'Internship'
//       : null;

//   if (!category) {
//     return res.status(400).json({ message: 'Invalid job category' });
//   }

//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ message: 'No files uploaded' });
//   }

//   const uploaded = [];
//   const rejected = [];

//   // Check if application row already exists
//   const [existingRows] = await getReadPool().execute(
//     `
//     SELECT resumes
//     FROM consultant_job_applications
//     WHERE consultant_user_id = ?
//       AND job_category = ?
//       AND job_ref_id = ?
//     `,
//     [user.id, category, jobId]
//   );

//   const hasApplicationRow = existingRows.length > 0;

//   for (const file of req.files) {
//     try {
//       // Generate hash
//       const hash = getFileHash(file.path);
//       const publicId = `consultant_resumes/${hash}`;

//       // Duplicate resume check (ONLY if row exists)
//       if (hasApplicationRow) {
//         const [[duplicate]] = await getReadPool().execute(
//           `
//           SELECT 1
//           FROM consultant_job_applications
//           WHERE consultant_user_id = ?
//             AND job_category = ?
//             AND job_ref_id = ?
//             AND JSON_SEARCH(resumes, 'one', ?, NULL, '$[*].public_id') IS NOT NULL
//           `,
//           [user.id, category, jobId, publicId]
//         );

//         if (duplicate) {
//           rejected.push(file.originalname);
//           continue;
//         }
//       }

//       // Upload to Cloudinary
//       const uploadResult = await uploadConsultantResume(file.path, hash);

//       // Insert / append in DB
//       const data = await jobApplicationService.uploadResume({
//         user,
//         jobId,
//         category,
//         resumeUrl: uploadResult.secure_url,
//         resumePublicId: uploadResult.public_id,
//       });

//       uploaded.push(data);
//     } catch (err) {
//       rejected.push(file.originalname);
//     }
//   }

//   return res.status(201).json({
//     message: 'Resume upload completed',
//     uploaded_count: uploaded.length,
//     rejected_count: rejected.length,
//     uploaded,
//     rejected,
//   });
// };



export const uploadResumeOnJobController = async (req, res) => {
  const { jobId, category: rawCategory } = req.params;
  const user = req.user;

  // Normalize category
  const category =
    rawCategory === 'HotVacancy'
      ? 'HotVacancy'
      : rawCategory === 'Internship'
      ? 'Internship'
      : null;

  if (!category) {
    return res.status(400).json({ message: 'Invalid job category' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const uploaded = [];
  const rejected = [];

  for (const file of req.files) {
    try {
      const hash = getFileHash(file.path);
      const publicId = `consultant_resumes/${hash}`;

      // ✅ ALWAYS check duplicate per file (NO cached flag)
      const [[duplicate]] = await getReadPool().execute(
        `
        SELECT 1
        FROM consultant_job_applications
        WHERE consultant_user_id = ?
          AND job_category = ?
          AND job_ref_id = ?
          AND JSON_SEARCH(resumes, 'one', ?, NULL, '$[*].public_id') IS NOT NULL
        `,
        [user.id, category, jobId, publicId]
      );

      if (duplicate) {
        rejected.push(file.originalname);
        continue;
      }

      // Upload to Cloudinary
      const uploadResult = await uploadConsultantResume(file.path, hash);

      // Insert / append resume
      const resume = await jobApplicationService.uploadResume({
        user,
        jobId,
        category,
        resumeUrl: uploadResult.secure_url,
        resumePublicId: uploadResult.public_id,
      });

      uploaded.push(resume);
    } catch (err) {
      console.error('Resume upload failed:', err);
      rejected.push(file.originalname);
    }
  }

  return res.status(201).json({
    message: 'Resume upload completed',
    uploaded_count: uploaded.length,
    rejected_count: rejected.length,
    uploaded,
    rejected,
  });
};