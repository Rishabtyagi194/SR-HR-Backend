// queries/jobApplicationQueries.js

export const jobApplicationQueries = {
  // applied by user on any jobs
  insertApplication: `
  INSERT INTO job_applications (
    user_id, employer_id, organisation_id, job_category, hotvacancy_job_id, internship_job_id
  ) VALUES (?, ?, ?, ?, ?, ?)
`,

  // store answer of the applied job
  insertAnswer: `
    INSERT INTO job_application_answers (application_id, question_text, answer_text)
    VALUES (?, ?, ?)
  `,

  // total count of the application
  getApplicationsCountByJobIds: `
    SELECT job_id, COUNT(*) AS total_applications
    FROM job_applications
    WHERE job_id IN (?)
    GROUP BY job_id
  `,

  // Fetch each application with FULL user details for Hot vacancy
  getApplicationsWithFullUserDataByHotVacancyJobId: `
    SELECT 
      ja.id AS application_id,
      ja.user_id,
      ja.application_status,
      ja.applied_at,
      
      u.full_name,
      u.email,
      u.phone,
      up.gender,
      u.work_status,
      u.total_experience_years,
      u.total_experience_months,
      u.availability_to_join,

      up.marital_status,
      up.dob,
      up.permanent_address,
      up.hometown,
      up.pincode,

      up.profile_title,
      up.resume_headline,
      up.profile_summary,
      up.disability_status,
      up.resume_url
      
    FROM job_applications ja
    JOIN users u ON ja.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE ja.hotvacancy_job_id = ?
    ORDER BY ja.applied_at DESC
  `,

  // Fetch each application with FULL user details for Internship applications
  getApplicationsWithFullUserDataByInternshipJobId: `
    SELECT 
      ja.id AS application_id,
      ja.user_id,
      ja.application_status,
      ja.applied_at,
      
      u.full_name,
      u.email,
      u.phone,
      up.gender,
      u.work_status,
      u.total_experience_years,
      u.total_experience_months,
      u.availability_to_join,

      up.marital_status,
      up.dob,
      up.permanent_address,
      up.hometown,
      up.pincode,

      up.profile_title,
      up.resume_headline,
      up.profile_summary,
      up.disability_status,
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
      ja.organisation_id,
      
      u.full_name,
      u.email,
      u.phone,
      u.work_status,
      u.total_experience_years,
      u.total_experience_months,
      u.availability_to_join,
      
      up.marital_status,
      up.dob,
      up.permanent_address,
      up.hometown,
      up.pincode,

      up.profile_title,
      up.resume_headline,
      up.profile_summary,
      up.disability_status,
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
    
    WHERE ja.organisation_id = ?
    ORDER BY ja.applied_at DESC
  `,

  // get questions for an application
  getAnswersByApplicationId: `
    SELECT question_text, answer_text 
    FROM job_application_answers 
    WHERE application_id = ?
  `,

  // get all applied application for users
  getUserAllAppliedJobs: `
  SELECT 
    ja.id AS application_id,
    ja.job_category,
    ja.application_status,
    ja.applied_at,
    ja.hotvacancy_job_id,
    ja.internship_job_id,
    ja.organisation_id,
    c.name AS name
  FROM job_applications ja
  LEFT JOIN organisations c ON ja.organisation_id = c.id
  WHERE ja.user_id = ?
  ORDER BY ja.applied_at DESC
`,

  getHotVacancyJobDetails: `
  SELECT 
    job_id,
    organisation_id,
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
    organisation_id,
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

  //  Fetch user's education, experience, skills, projects and accomplistments (social profile, sample work, certification)
  getUserEducations: `
    SELECT degree, institute_name, specialization, course_type, start_year, end_year, percentage
    FROM user_education WHERE user_id = ?
  `,

  getUserExperiences: `
    SELECT is_current_employment, employment_type, company_name, job_title, job_profile, start_date, end_date
    FROM user_experience WHERE user_id = ?
  `,

  getUserSkills: `
    SELECT skill_name, proficiency_level
    FROM user_skills WHERE user_id = ?
  `,
  
  // projects
  getUserProjects: `
    SELECT project_title, project_details, project_status, work_from_year,
    work_from_month, work_to_year, work_to_month
    FROM user_projects WHERE user_id = ?
  `,

  // social profile
  getUsersocialProfile: `
    SELECT social_profile, social_profile_url, social_profile_description 
    FROM user_social_profiles WHERE user_id = ?
  `,

  // sample work
  getUserWorkSample: `
    SELECT work_sample_title, work_sample_url, work_sample_description, 
    work_from_year, work_from_month, work_to_year, work_to_month
    FROM user_work_samples WHERE user_id = ?
  `,

  // certification
  getUserCertification: `
    SELECT certification_name, certification_completion_id, certification_url
    FROM user_certifications WHERE user_id = ?
  `,

  // ------------------------------ consultant ------------------------------------

  getConsultantApplicationsByHotVacancyJobId: `
  SELECT
    cja.id AS application_id,
    cja.job_ref_id,
    cja.job_category,
    cja.consultant_user_id,
    cja.consultant_org_id,
    cja.employer_org_id,
    cja.posted_by_consultant,
    cja.posted_by_consultant_email,
    cja.resumes,
    cja.applied_at
  FROM consultant_job_applications cja
  WHERE
    cja.job_category = 'HotVacancy'
    AND cja.job_ref_id = ?
    AND cja.employer_org_id = ?
  ORDER BY cja.applied_at DESC
`,

  getConsultantApplicationsByInternshipJobId: `
  SELECT
    cja.id AS application_id,
    cja.job_ref_id,
    cja.job_category,
    cja.consultant_user_id,
    cja.consultant_org_id,
    cja.employer_org_id,
    cja.posted_by_consultant,
    cja.posted_by_consultant_email,
    cja.resumes,
    cja.applied_at
  FROM consultant_job_applications cja
  WHERE
    cja.job_category = 'Internship'
    AND cja.job_ref_id = ?
    AND cja.employer_org_id = ?
  ORDER BY cja.applied_at DESC
`,

  // see applied jobs by consultant
  getConsultantUploadedJobs: `
  SELECT
    cja.id AS application_id,
    cja.job_ref_id,
    cja.employer_org_id,
    cja.consultant_user_id,
    cja.job_category,
    cja.applied_at,
    cja.updated_at,

    JSON_LENGTH(cja.resumes) AS total_resumes,

    -- Employer
    org.name AS employer_name,

    -- Hot Vacancy Job
    hj.jobTitle AS hotvacancy_title,
    hj.workMode AS hotvacancy_work_mode,
    hj.locality AS hotvacancy_location,

    -- Internship Job
    ij.internshipTitle AS internship_title,
    ij.workMode AS internship_work_mode,
    ij.intershipLocation AS internship_location

  FROM consultant_job_applications cja
  JOIN organisations org ON cja.employer_org_id = org.id

  LEFT JOIN HotVacancyJobs hj
    ON cja.job_category = 'HotVacancy'
    AND cja.job_ref_id = hj.job_id

  LEFT JOIN InternshipJobs ij
    ON cja.job_category = 'Internship'
    AND cja.job_ref_id = ij.job_id

  WHERE cja.consultant_user_id = ?
  ORDER BY cja.applied_at DESC
`,

  getHotVacancyJobByJobIdAndOrgId: `
    SELECT
      job_id,
      organisation_id,
      employer_id,
      staff_id,
      category,
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
      posted_by_email,
      postedBy,
      is_consultant_Job_Active,
      Status,
      created_at,
      updated_at
    FROM HotVacancyJobs
    WHERE job_id = ?
      AND organisation_id = ?
    LIMIT 1
  `,
};

// export const jobApplicationQueries = {
//   insertApplication: `INSERT INTO job_applications (job_id, user_id, employer_id, organisation_id) VALUES (?, ?, ?, ?)`,

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
