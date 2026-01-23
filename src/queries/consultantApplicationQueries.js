import { getReadPool, getWritePool } from "../config/database.js";

export const getApplicationsByEmployerOrg = (limit, offset) => `
  SELECT
    cja.id AS application_id,
    cja.job_ref_id,
    cja.job_category,
    cja.consultant_user_id,
    cja.consultant_org_id,
    cja.employer_org_id,
    cja.employer_user_id,
    cja.posted_by_consultant,
    cja.posted_by_consultant_email,
    cja.applied_at,
    cja.resumes
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


// update the status of the resume by employer, uploaded by consultant
export const updateResumeStatus = async (
  employerUserId,
  applicationId,
  resumeId,
  status
) => {
  const pool = getWritePool(); // ✅ write pool

  // 1️⃣ Fetch resumes (EMPLOYER ownership)
  const [[row]] = await pool.query(
    `
    SELECT resumes
    FROM consultant_job_applications
    WHERE id = ?
      AND employer_user_id = ?
    `,
    [applicationId, employerUserId]
  );

  console.log('row', row);

  if (!row || !Array.isArray(row.resumes)) return null;

  let updatedResume = null;

  // 2️⃣ Update specific resume
  const updatedResumes = row.resumes.map(resume => {
    if (resume.resume_id === resumeId) {
      updatedResume = {
        ...resume,
        status,
        updated_at: new Date().toISOString()
      };
      return updatedResume;
    }
    return resume;
  });

  if (!updatedResume) return null;

  // 3️⃣ Save back to DB
  await pool.query(
    `
    UPDATE consultant_job_applications
    SET resumes = ?, updated_at = NOW()
    WHERE id = ?
      AND employer_user_id = ?
    `,
    [JSON.stringify(updatedResumes), applicationId, employerUserId]
  );

  return updatedResume;
};

