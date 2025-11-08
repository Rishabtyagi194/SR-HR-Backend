import { getReadPool, getWritePool } from '../config/database.js';
import { jobApplicationQueries } from '../queries/jobApplicationQueries.js';

const applyForJob = async (jobId, user_id, answers = []) => {
  //  Validate inputs
  if (!jobId || !user_id) {
    throw new Error('Missing required parameters');
  }

  // Check if job exists and get employer + company info
  const [jobRows] = await getReadPool().query(`SELECT employer_id, company_id FROM HotVacancyJobs WHERE job_id = ?`, [jobId]);

  if (!jobRows.length) throw new Error('Job not found');

  const { employer_id, company_id } = jobRows[0];

  //  Check if user already applied
  const [existingApplication] = await getReadPool().query(
    `
    SELECT id FROM job_applications WHERE job_id = ? AND user_id = ?`,
    [jobId, user_id],
  );

  if (existingApplication.length > 0) {
    // Instead of throwing, return flag
    return { alreadyApplied: true, message: 'You have already applied for this job.' };
  }

  //  Insert new application
  const [applicationResult] = await getWritePool().query(jobApplicationQueries.insertApplication, [
    jobId,
    user_id,
    employer_id,
    company_id,
  ]);

  const applicationId = applicationResult.insertId;

  //  Insert each answer (if any)
  if (answers && answers.length > 0) {
    for (const ans of answers) {
      await getWritePool().query(jobApplicationQueries.insertAnswer, [applicationId, ans.question, JSON.stringify(ans.answer)]);
    }
  }

  //  Return success
  return { applicationId };
};

const getApplicationsForJob = async (jobId) => {
  if (!jobId) throw new Error('Missing jobId');

  // Fetch applications
  const [applications] = await getReadPool().query(jobApplicationQueries.getApplicationsWithFullUserDataByJobId, [jobId]);

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

export default {
  applyForJob,
  getApplicationsForJob,
};
