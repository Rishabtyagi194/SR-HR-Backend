import { getReadPool } from '../config/database.js';
import {
  getApplicationsByEmployerOrg,
  countApplicationsByEmployerOrg,
} from '../queries/consultantApplicationQueries.js';
import { jobApplicationQueries } from '../queries/jobApplicationQueries.js';

export const listApplicationsUploadedByConsultant = async ({  employerOrgId,  limit,  offset,}) => {
  // HARD SAFETY
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;

  // Fetch paginated data
  const [applications] = await getReadPool().query(
    getApplicationsByEmployerOrg(safeLimit, safeOffset),
    [employerOrgId]
  );

  // Count total
  const [[{ total }]] = await getReadPool().execute(
    countApplicationsByEmployerOrg,
    [employerOrgId]
  );

  return { applications, total };
};

export const getConsultantUploadedJobs = async (consultantUserId) => {
  const [rows] = await getReadPool().query(
    jobApplicationQueries.getConsultantUploadedJobs,
    [consultantUserId]
  );

  return rows.map(row => ({
    application_id: row.application_id,
    job_id: row.job_ref_id,
    employer_org_id: row.employer_org_id,
    consultant_user_id: row.consultant_user_id,
    job_category: row.job_category,
    job_title: row.job_category === 'HotVacancy'
      ? row.hotvacancy_title
      : row.internship_title,

    employer_name: row.employer_name,
    work_mode: row.job_category === 'HotVacancy'
      ? row.hotvacancy_work_mode
      : row.internship_work_mode,

    location: row.job_category === 'HotVacancy'
      ? row.hotvacancy_location
      : row.internship_location,

    total_resumes: row.total_resumes,
    application_status: row.application_status,
    applied_at: row.applied_at,
    updated_at: row.updated_at
  }));
};

// get job by org id, job id and job category
export const getJobByJobIdAndOrgId = async (jobRefId, employerOrgId) => {
  const [rows] = await getReadPool().query(
    jobApplicationQueries.getHotVacancyJobByJobIdAndOrgId,
    [jobRefId, employerOrgId]
  );

  if (!rows.length) return null;

  const job = rows[0];

  // Parse JSON fields safely
  job.skills = JSON.parse(job.skills || '[]');
  job.jobLocation = JSON.parse(job.jobLocation || '{}');
  job.qualification = JSON.parse(job.qualification || '[]');
  job.questions = JSON.parse(job.questions || '[]');

  return job;
};
