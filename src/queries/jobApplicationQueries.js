// queries/jobApplicationQueries.js

export const jobApplicationQueries = {
  insertApplication: `
  INSERT INTO job_applications (
    user_id, employer_id, company_id, job_category, hotvacancy_job_id, internship_job_id
  ) VALUES (?, ?, ?, ?, ?, ?)
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

  // Fetch each application with FULL user details
  getApplicationsWithFullUserDataByHotVacancyJobId: `
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
    WHERE ja.hotvacancy_job_id = ?
    ORDER BY ja.applied_at DESC
  `,

  //  Internship applications
  getApplicationsWithFullUserDataByInternshipJobId: `
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
    WHERE ja.internship_job_id = ?
    ORDER BY ja.applied_at DESC
  `,


  // to fetch all response on all jobs
  getAllCompanyApplications: `
    SELECT 
      ja.id AS application_id,
      ja.job_category,
      ja.application_status,
      ja.applied_at,
      ja.company_id,
      u.full_name,
      u.email,
      u.phone,
      up.gender,
      up.address,
      up.city,
      up.state,
      up.country,
      up.profile_title,
      up.about_me,
      up.current_location,
      up.preferred_location,
      up.total_experience_years,
      up.total_experience_months,
      up.notice_period,
      up.expected_salary,
      up.resume_url,
      
      -- Hot Vacancy Job fields
      hj.job_id AS hotvacancy_job_id,
      hj.jobTitle AS hotvacancy_title,
      hj.CompanyIndustry AS hotvacancy_industry,
      hj.workMode AS hotvacancy_workMode,
      hj.locality AS hotvacancy_location,
      
      -- Internship Job fields
      ij.job_id AS internship_job_id,
      ij.internshipTitle AS internship_title,
      ij.CompanyIndustry AS internship_industry,
      ij.workMode AS internship_workMode,
      ij.intershipLocation AS internship_location
      
    FROM job_applications ja
    JOIN users u ON ja.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    
    -- join both job tables
    LEFT JOIN HotVacancyJobs hj ON ja.hotvacancy_job_id = hj.job_id
    LEFT JOIN InternshipJobs ij ON ja.internship_job_id = ij.job_id
    
    WHERE ja.company_id = ?
    ORDER BY ja.applied_at DESC
  `,

  getAnswersByApplicationId: `
    SELECT question_text, answer_text 
    FROM job_application_answers 
    WHERE application_id = ?
  `,

  // get all applied applicatio for users
  getUserAllAppliedJobs: `
  SELECT 
    ja.id AS application_id,
    ja.job_category,
    ja.application_status,
    ja.applied_at,
    ja.hotvacancy_job_id,
    ja.internship_job_id,
    ja.company_id,
    c.name AS name
  FROM job_applications ja
  LEFT JOIN companies c ON ja.company_id = c.id
  WHERE ja.user_id = ?
  ORDER BY ja.applied_at DESC
`,

  getHotVacancyJobDetails: `
  SELECT 
    job_id,
    company_id,
    employer_id,
    jobTitle,
    employmentType,
    skills,
    CompanyIndustry,
    workMode,
    jobLocation,
    willingToRelocate,
    locality,
    experinceFrom,
    experinceTo,
    salaryRangeFrom,
    salaryRangeTo,
    qualification,
    jobDescription,
    AboutCompany,
    include_walk_in_details,
    walk_in_start_date,
    duration_days,
    walk_in_start_time,
    walk_in_end_time,
    contact_person,
    contact_number,
    venue,
    google_maps_url,
    questions,
    Status,
    created_at,
    updated_at
  FROM HotVacancyJobs
  WHERE job_id = ?
`,

  getInternshipJobDetails: `
  SELECT 
    job_id,
    company_id,
    employer_id,
    internshipTitle,
    employmentType,
    duration,
    internshipStartDate,
    OfferStipend,
    workMode,
    intershipLocation,
    willingToRelocate,
    CompanyIndustry,
    perksAndBenefit,
    noOfVacancies,
    skills,
    qualification,
    videoProfile,
    jobDescription,
    lastDateToApply,
    collabrateWithTeam,
    receivedResponseOverMail,
    addResponseCode,
    AboutCompany,
    Status,
    created_at,
    updated_at
  FROM InternshipJobs
  WHERE job_id = ?
`,

  //  Fetch user's education, experience, and skills
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
