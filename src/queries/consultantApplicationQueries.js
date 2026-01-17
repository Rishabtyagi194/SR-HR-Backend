export const getApplicationsByEmployerOrg = (limit, offset) => `
  SELECT
    cja.id AS application_id,
    cja.job_ref_id,
    cja.job_category,
    cja.consultant_user_id,
    cja.consultant_org_id,
    cja.employer_org_id,
    cja.resumes,
    cja.posted_by_consultant,
    cja.posted_by_consultant_email,
    cja.applied_at
  FROM consultant_job_applications cja
  WHERE cja.employer_org_id = ?
  ORDER BY cja.applied_at DESC
  LIMIT ${limit} OFFSET ${offset}
`;

export const countApplicationsByEmployerOrg = `
  SELECT COUNT(*) AS total
  FROM consultant_job_applications
  WHERE employer_org_id = ?
`;
