import { getReadPool, getWritePool } from '../config/database.js';

export const saveJob = async (req, res) => {
  const userId = req.user.id;
  const jobId = req.params.jobId;
  const jobType = req.query.type; // HotVacancy | Internship

  console.log('JobId', jobId);
  console.log('jobType', jobType);

  if (!['HotVacancy', 'Internship'].includes(jobType)) {
    return res.status(400).json({ message: 'Invalid job type' });
  }

  let jobExistsQuery = '';
  let params = [jobId];

  console.log('params', params);

  if (jobType === 'HotVacancy') {
    jobExistsQuery = `SELECT job_id FROM HotVacancyJobs WHERE job_id = ? AND Status = 'active'`;
  } else {
    jobExistsQuery = `SELECT job_id FROM InternshipJobs WHERE job_id = ? AND Status = 'active'`;
  }

  const [rows] = await getReadPool().execute(jobExistsQuery, params);
  console.log('rows', rows);

  if (rows.length === 0) {
    return res.status(404).json({
      message: 'Job not found or inactive',
    });
  }

  try {
    await getWritePool().execute(
      `INSERT IGNORE INTO saved_jobs (user_id, job_id, job_type)
       VALUES (?, ?, ?)`,
      [userId, jobId, jobType],
    );

    res.json({ message: 'Job saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error saving job' });
  }
};

export const unsaveJob = async (req, res) => {
  const userId = req.user.id;
  const jobId = req.params.jobId;
  const jobType = req.query.type;

  if (!['HotVacancy', 'Internship'].includes(jobType)) {
    return res.status(400).json({ message: 'Invalid job type' });
  }

  await getWritePool().execute(
    `DELETE FROM saved_jobs
     WHERE user_id = ? AND job_id = ? AND job_type = ?`,
    [userId, jobId, jobType],
  );

  res.json({ message: 'Job removed from saved list' });
};

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('userId', userId);

    const [saved] = await getReadPool().execute(
      `
      SELECT job_id, job_type, created_at
      FROM saved_jobs
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId],
    );

    console.log('saved', saved);
    console.log('length', saved.length);

    if (!saved.length) {
      return res.json({
        message: 'No saved jobs',
        total: 0,
        jobs: [],
      });
    }

    const hotVacancyIds = [];
    const internshipIds = [];

    saved.forEach((job) => {
      if (job.job_type === 'HotVacancy') hotVacancyIds.push(job.job_id);
      if (job.job_type === 'Internship') internshipIds.push(job.job_id);
    });

    let hotVacancyJobs = [];
    let internshipJobs = [];
    
    if (hotVacancyIds.length) {
      [hotVacancyJobs] = await getWritePool().execute(
        `
    SELECT *, 'HotVacancy' AS job_type
    FROM HotVacancyJobs
    WHERE job_id IN (${hotVacancyIds.map(() => '?').join(',')})
      AND LOWER(Status) = 'active'
    `,
        hotVacancyIds,
      );
    }

    if (internshipIds.length) {
      [internshipJobs] = await getWritePool().execute(
        `
    SELECT *, 'Internship' AS job_type
    FROM InternshipJobs
    WHERE job_id IN (${internshipIds.map(() => '?').join(',')})
      AND LOWER(Status) = 'active'
    `,
        internshipIds,
      );
    }

    res.status(200).json({
      message: 'Saved jobs fetched successfully',
      total: hotVacancyJobs.length + internshipJobs.length,
      jobs: [...hotVacancyJobs, ...internshipJobs],
    });
  } catch (error) {
    console.error('Get saved jobs error:', error.message);
    res.status(500).json({
      message: 'Error fetching saved jobs',
      error: error.message,
    });
  }
};
