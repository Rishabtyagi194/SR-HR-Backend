// queries/jobApplicationQueries.js

export const jobApplicationQueries = {
  getEmployerIdByJobId: `
    SELECT employer_id FROM HotVacancyJobs WHERE job_id = ?
  `,

  insertApplication: `
    INSERT INTO job_applications (job_id, user_id, employer_id)
    VALUES (?, ?, ?)
  `,

  insertAnswer: `
    INSERT INTO job_application_answers (application_id, question_text, answer_text)
    VALUES (?, ?, ?)
  `,

  getApplicationsByJobId: `
    SELECT a.id as application_id, a.user_id, u.full_name, a.applied_at
    FROM job_applications a
    JOIN users u ON u.id = a.user_id
    WHERE a.job_id = ?
    ORDER BY a.applied_at DESC
  `,

  getAnswersByApplicationId: `
    SELECT question_text, answer_text
    FROM job_application_answers
    WHERE application_id = ?
  `,
};
