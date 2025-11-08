// queries/jobApplicationQueries.js

export const jobApplicationQueries = {
  insertApplication: `
    INSERT INTO job_applications (job_id, user_id, employer_id, company_id)
    VALUES (?, ?, ?, ?)
  `,

  insertAnswer: `
    INSERT INTO job_application_answers (application_id, question_text, answer_text)
    VALUES (?, ?, ?)
  `,

  getApplicationsCountByJobIds: `
    SELECT job_id, COUNT(*) AS total_applications
    FROM job_applications
    WHERE job_id IN (?)
    GROUP BY job_id
  `,

  // ✅ Fetch each application with FULL user details
  getApplicationsWithFullUserDataByJobId: `
    SELECT 
      ja.id AS application_id,
      ja.user_id,
      ja.application_status,
      ja.applied_at,
      u.full_name,
      u.email,
      u.phone,
      up.profile_title,
      up.about_me,
      up.current_location,
      up.preferred_location,
      up.total_experience_years,
      up.total_experience_months,
      up.expected_salary,
      up.notice_period,
      up.resume_url
    FROM job_applications ja
    JOIN users u ON ja.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE ja.job_id = ?
    ORDER BY ja.applied_at DESC
  `,

  getAnswersByApplicationId: `
    SELECT question_text, answer_text 
    FROM job_application_answers 
    WHERE application_id = ?
  `,

  // ✅ Fetch user's education, experience, and skills
  getUserEducations: `
    SELECT degree, specialization, institute_name, start_year, end_year, percentage
    FROM user_education WHERE user_id = ?
  `,
  getUserExperiences: `
    SELECT company_name, job_title, start_date, end_date, currently_working, description
    FROM user_experience WHERE user_id = ?
  `,
  getUserSkills: `
    SELECT skill_name, proficiency_level
    FROM user_skills WHERE user_id = ?
  `,
};

// export const jobApplicationQueries = {
//   insertApplication: `INSERT INTO job_applications (job_id, user_id, employer_id, company_id) VALUES (?, ?, ?, ?)`,

//   insertAnswer: `INSERT INTO job_application_answers (application_id, question_text, answer_text) VALUES (?, ?, ?)`,

//   // existing ones...
//   getEmployerIdByJobId: `SELECT employer_id FROM HotVacancyJobs WHERE job_id = ?`,

//   // new queries
//   getApplicationsCountByJobIds: `
//     SELECT job_id, COUNT(*) AS total_applications
//     FROM job_applications
//     WHERE job_id IN (?)
//     GROUP BY job_id
//   `,

//   getApplicationsWithUserDataByJobId: `
//     SELECT
//       ja.id AS application_id,
//       ja.user_id,
//       ja.application_status,
//       ja.applied_at,
//       u.full_name,
//       u.email,
//       u.phone
//     FROM job_applications ja
//     JOIN users u ON ja.user_id = u.id
//     WHERE ja.job_id = ?
//     ORDER BY ja.applied_at DESC
//   `,

//   getAnswersByApplicationId: `
//     SELECT question_text, answer_text FROM job_application_answers WHERE application_id = ?
//   `,
// };

// export const jobApplicationQueries = {
//   getEmployerIdByJobId: `
//     SELECT employer_id FROM HotVacancyJobs WHERE job_id = ?
//   `,

//   insertApplication: `
//     INSERT INTO job_applications (job_id, user_id, employer_id)
//     VALUES (?, ?, ?)
//   `,

//   insertAnswer: `
//     INSERT INTO job_application_answers (application_id, question_text, answer_text)
//     VALUES (?, ?, ?)
//   `,

//   getApplicationsByJobId: `
//     SELECT a.id as application_id, a.user_id, u.full_name, a.applied_at
//     FROM job_applications a
//     JOIN users u ON u.id = a.user_id
//     WHERE a.job_id = ?
//     ORDER BY a.applied_at DESC
//   `,

//   getAnswersByApplicationId: `
//     SELECT question_text, answer_text
//     FROM job_application_answers
//     WHERE application_id = ?
//   `,
// };
