import { getReadPool, getWritePool } from '../config/database.js';
import { jobApplicationQueries } from '../queries/jobApplicationQueries.js';

// Apply on a particular job
const applyForJob = async (jobId, user_id, answers = [], category) => {
  if (!jobId || !user_id) throw new Error('Missing required parameters');
  if (!category) throw new Error('Missing job category');

  let jobRows = [];

  if (category === 'HotVacancy') {
    [jobRows] = await getReadPool().query(
      `SELECT employer_id, company_id, 'HotVacancy' AS category 
       FROM HotVacancyJobs WHERE job_id = ?`,
      [jobId],
    );
  } else if (category === 'Internship') {
    [jobRows] = await getReadPool().query(
      `SELECT employer_id, company_id, 'Internship' AS category 
       FROM InternshipJobs WHERE job_id = ?`,
      [jobId],
    );
  } else {
    throw new Error('Invalid category type');
  }

  if (!jobRows.length) throw new Error('Job not found');
  const { employer_id, company_id } = jobRows[0];

  // Check if already applied
  const [existing] = await getReadPool().query(
    `SELECT id FROM job_applications 
     WHERE user_id = ? 
     AND job_category = ? 
     AND (
          (? = 'HotVacancy' AND hotvacancy_job_id = ?) 
          OR 
          (? = 'Internship' AND internship_job_id = ?)
         )`,
    [user_id, category, category, jobId, category, jobId],
  );

  if (existing.length) {
    return { alreadyApplied: true, message: 'You have already applied for this job.' };
  }

  // Insert new record
  const [result] = await getWritePool().query(jobApplicationQueries.insertApplication, [
    user_id,
    employer_id,
    company_id,
    category,
    category === 'HotVacancy' ? jobId : null,
    category === 'Internship' ? jobId : null,
  ]);

  const applicationId = result.insertId;

  //  Insert answers
  if (answers && answers.length > 0) {
    for (const ans of answers) {
      await getWritePool().query(jobApplicationQueries.insertAnswer, [applicationId, ans.question, JSON.stringify(ans.answer)]);
    }
  }

  console.log(`Application submitted for ${category} job_id=${jobId}`);
  return { applicationId, category };
};

// get a response/application for a  particular job
const getApplicationsForJob = async (jobId, category) => {
  if (!jobId || !category) throw new Error('Missing jobId or category');

  let query;
  if (category === 'HotVacancy') {
    query = jobApplicationQueries.getApplicationsWithFullUserDataByHotVacancyJobId;
  } else if (category === 'Internship') {
    query = jobApplicationQueries.getApplicationsWithFullUserDataByInternshipJobId;
  } else {
    throw new Error('Invalid category');
  }

  const [applications] = await getReadPool().query(query, [jobId]);

  if (!applications.length) return [];

  // Fetch answers for each application
  for (const app of applications) {
    const [answers] = await getReadPool().query(jobApplicationQueries.getAnswersByApplicationId, [app.application_id]);
    app.answers = answers.map((a) => ({
      question: a.question_text,
      answer: a.answer_text ? JSON.parse(a.answer_text) : null,
    }));
  }

  return applications;
};

//  get app applications/response for a particular company/employer
const getAllCompanyApplications = async (companyId) => {
  if (!companyId) throw new Error('Missing companyId');

  // Fetch all applications across all job types within this company
  const [applications] = await getReadPool().query(jobApplicationQueries.getAllCompanyApplications, [companyId]);

  // Fetch answers for each application
  for (const app of applications) {
    const [answers] = await getReadPool().query(jobApplicationQueries.getAnswersByApplicationId, [app.application_id]);

    app.answers = answers.map((a) => ({
      question: a.question_text,
      answer: a.answer_text ? JSON.parse(a.answer_text) : null,
    }));
  }

  return applications;
};

// get applied job for a user

const getUserAllAppliedJobs = async (userId) => {
  if (!userId) throw new Error('Missing userId');

  // Fetch all applications first
  const [applications] = await getReadPool().query(jobApplicationQueries.getUserAllAppliedJobs, [userId]);

  const detailedJobs = [];

  for (const app of applications) {
    let jobDetails = null;

    // Fetch job details based on category
    if (app.job_category === 'HotVacancy' && app.hotvacancy_job_id) {
      const [rows] = await getReadPool().query(jobApplicationQueries.getHotVacancyJobDetails, [app.hotvacancy_job_id]);
      jobDetails = rows[0] || null;
    } else if (app.job_category === 'Internship' && app.internship_job_id) {
      const [rows] = await getReadPool().query(jobApplicationQueries.getInternshipJobDetails, [app.internship_job_id]);
      jobDetails = rows[0] || null;
    }

    detailedJobs.push({
      ...app,
      jobDetails,
    });
  }

  return detailedJobs;
};

export default {
  applyForJob,
  getApplicationsForJob,
  getAllCompanyApplications,
  getUserAllAppliedJobs,
};
