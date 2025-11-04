// services/jobApplicationService.js
import { getReadPool, getWritePool } from '../config/database.js';
import { jobApplicationQueries } from '../queries/jobApplicationQueries.js';

const applyForJob = async (jobId, user_id, answers) => {
  // Check if job exists
  const [job] = await getReadPool().query(jobApplicationQueries.getEmployerIdByJobId, [jobId]);
  if (!job.length) throw new Error('Job not found');

  const employer_id = job[0].employer_id;

  // Insert new application
  const [applicationResult] = await getWritePool().query(jobApplicationQueries.insertApplication, [jobId, user_id, employer_id]);

  const applicationId = applicationResult.insertId;

  // Insert each answer
  for (const ans of answers) {
    await getWritePool().query(jobApplicationQueries.insertAnswer, [applicationId, ans.question, JSON.stringify(ans.answer)]);
  }

  return { applicationId };
};

const getApplicationsForJob = async (jobId) => {
  const [applications] = await getReadPool().query(jobApplicationQueries.getApplicationsByJobId, [jobId]);

  for (const app of applications) {
    const [answers] = await getReadPool().query(jobApplicationQueries.getAnswersByApplicationId, [app.application_id]);

    app.answers = answers.map((a) => ({
      question: a.question_text,
      answer: JSON.parse(a.answer_text),
    }));
  }

  return applications;
};

export default {
  applyForJob,
  getApplicationsForJob,
};
