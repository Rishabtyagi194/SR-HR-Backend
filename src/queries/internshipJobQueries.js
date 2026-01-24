import { getReadPool, getWritePool } from '../config/database.js';
import Internship from '../models/internship.model.js';
import { jobApplicationQueries } from './jobApplicationQueries.js';

class internshipQueries {
  async create(jobsdata) {
    const internship = new Internship(jobsdata);
    const dbObject = internship.toDatabaseObject();

    const sql = `
    INSERT INTO InternshipJobs (
      organisation_id, employer_id, staff_id, internshipTitle, employmentType,
      duration, internshipStartDate, OfferStipend, workMode,
      intershipLocation, willingToRelocate, CompanyIndustry, perksAndBenefit,
      noOfVacancies, skills, qualification, videoProfile, jobDescription,
      lastDateToApply, collabrateWithTeam, receivedResponseOverMail,
      addResponseCode, AboutCompany, posted_by_email, postedBy, is_consultant_Job_Active, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      dbObject.organisation_id ?? null,
      dbObject.employer_id ?? null,
      dbObject.staff_id ?? null,

      dbObject.internshipTitle ?? null,
      dbObject.employmentType ?? null,
      dbObject.duration ?? null,
      dbObject.internshipStartDate ?? null,
      dbObject.OfferStipend ?? null,
      dbObject.workMode ?? null,

      // JSON fields (ALWAYS stringify)
      JSON.stringify(dbObject.intershipLocation ?? []),

      dbObject.willingToRelocate ?? false,
      dbObject.CompanyIndustry ?? null,
      dbObject.perksAndBenefit ?? null,
      dbObject.noOfVacancies ?? null,

      JSON.stringify(dbObject.skills ?? []),
      dbObject.qualification ?? null,

      dbObject.videoProfile ?? null,
      dbObject.jobDescription ?? null,
      dbObject.lastDateToApply ?? null,

      JSON.stringify(dbObject.collabrateWithTeam ?? []),

      dbObject.receivedResponseOverMail ?? null,
      dbObject.addResponseCode ?? null,
      dbObject.AboutCompany ?? null,

      dbObject.posted_by_email ?? null,
      dbObject.postedBy, // 'company' or 'consultant'

      dbObject.is_consultant_Job_Active ?? false,

      // Status (use ?? not ||)
      dbObject.Status ?? 'draft',
    ];

    if (values.includes(undefined)) {
      console.error('Undefined value found in insert:', values);
      throw new Error('One or more required fields are undefined');
    }

    // console.log('Insert values:', dbObject);

    const [result] = await getWritePool().execute(sql, values);

    // Return the complete job using fromDatabaseRow for proper parsing
    return await this.getInternshipById(result.insertId);
  }

  // async allInternship(page = 1, limit = 10, companyId = null, includeApplications = false) {
  //   const offset = (page - 1) * limit;

  //   let rows, total;

  //   if (companyId) {
  //     // Dashboard → only jobs for that organization
  //     [rows] = await getReadPool().query(
  //       `SELECT * FROM InternshipJobs
  //       WHERE organisation_id = ?
  //       ORDER BY created_at DESC
  //       LIMIT ? OFFSET ?`,
  //       [companyId, limit, offset],
  //     );

  //     //total jobs
  //     [[{ total }]] = await getReadPool().execute(
  //       `
  //       SELECT COUNT(*) as total FROM InternshipJobs WHERE organisation_id = ?`,
  //       [companyId],
  //     );
  //   } else {
  //     // Client side all jobs
  //     [rows] = await getReadPool().query(
  //       `SELECT * FROM InternshipJobs
  //       WHERE LOWER(Status) = 'active'
  //       ORDER BY created_at DESC
  //       LIMIT ? OFFSET ?`,
  //       [limit, offset],
  //     );

  //     [[{ total }]] = await getReadPool().execute(`
  //       SELECT COUNT(*) as total
  //       FROM InternshipJobs
  //       WHERE Status = 'active'
  //       `);
  //   }

  //   // attach total responses
  //   if (includeApplications && rows.length > 0) {
  //     const jobIds = rows.map((j) => j.job_id);
  //     const [counts] = await getReadPool().query(jobApplicationQueries.getApplicationsCountByJobIds, [jobIds]);

  //     // convert to map for fast lookup
  //     const countMap = {};
  //     for (const c of counts) countMap[c.job_id] = c.total_applications;

  //     // attach counts
  //     for (const job of rows) {
  //       job.total_applications = countMap[job.job_id] || 0;
  //     }
  //   }

  //   return { jobs: rows, total };
  // }

  async getDashboardInternships(page, limit, role, organisationId, userId) {
    const offset = (page - 1) * limit;
    let where = '';
    let params = [];

    if (role.endsWith('_admin')) {
      where = 'organisation_id = ?';
      params = [organisationId];
    } else {
      where = 'organisation_id = ? AND (employer_id = ? OR staff_id = ?)';
      params = [organisationId, userId, userId];
    }

    const [rows] = await getReadPool().query(
      `
    SELECT *
    FROM InternshipJobs
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
      [...params, limit, offset],
    );

    const [[{ total }]] = await getReadPool().execute(
      `
    SELECT COUNT(*) AS total
    FROM InternshipJobs
    WHERE ${where}
    `,
      params,
    );

    return { jobs: rows, total };
  }

  async getPublicInternships(page, limit, role) {
    const offset = (page - 1) * limit;
    let condition = '';

    if (role === 'job_seeker') {
      condition = `
      Status = 'active'
      AND (postedBy = 'company' OR postedBy = 'consultant')
    `;
    } else {
      // consultant_admin / consultant_staff
      condition = `
      Status = 'active'
      AND ( postedBy = 'company' AND is_consultant_Job_Active = 1)
    `;
    }

    const [rows] = await getReadPool().query(
      `
    SELECT *
    FROM InternshipJobs
    WHERE ${condition}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    const [[{ total }]] = await getReadPool().execute(
      `
    SELECT COUNT(*) AS total
    FROM InternshipJobs
    WHERE ${condition}
    `,
    );

    return { jobs: rows, total };
  }

  async getInternshipWithApplications(jobId, companyId = null) {
    // fetch job
    const [internshipRows] = companyId
      ? await getReadPool().query(`SELECT * FROM InternshipJobs WHERE job_id = ? AND organisation_id = ?`, [jobId, companyId])
      : await getReadPool().query(`SELECT * FROM InternshipJobs WHERE job_id = ?`, [jobId]);

    if (!internshipRows.length) return null;
    const job = internshipRows[0];

    // fetch applications + user data
    const [applications] = await getReadPool().query(jobApplicationQueries.getApplicationsWithFullUserDataByInternshipJobId, [jobId]);

    for (const app of applications) {
      const [answers] = await getReadPool().query(jobApplicationQueries.getAnswersByApplicationId, [app.application_id]);

      app.answers = answers.map((a) => ({
        question: a.question_text,
        answer: JSON.parse(a.answer_text || '""'),
      }));

      // Full profile
      const [educations] = await getReadPool().query(jobApplicationQueries.getUserEducations, [app.user_id]);
      const [experiences] = await getReadPool().query(jobApplicationQueries.getUserExperiences, [app.user_id]);
      const [skills] = await getReadPool().query(jobApplicationQueries.getUserSkills, [app.user_id]);
      const [projects] = await getReadPool().query(jobApplicationQueries.getUserProjects, [app.user_id]);
      const [social_profile] = await getReadPool().query(jobApplicationQueries.getUsersocialProfile, [app.user_id]);
      const [work_sample] = await getReadPool().query(jobApplicationQueries.getUserWorkSample, [app.user_id]);
      const [certification] = await getReadPool().query(jobApplicationQueries.getUserCertification, [app.user_id]);

      app.profile = { educations, experiences, skills, projects, social_profile, work_sample, certification };
    }

    // CONSULTANT applications
    const [consultantApplications] = await getReadPool().query(jobApplicationQueries.getConsultantApplicationsByInternshipJobId, [
      jobId,
      job.organisation_id,
    ]);

    // Parse resumes JSON safely
    const parsedConsultantApplications = consultantApplications.map((app) => ({
      ...app,
      resumes: Array.isArray(app.resumes) ? app.resumes : JSON.parse(app.resumes || '[]'),
    }));

    // Attach everything
    job.user_applications = applications;
    job.consultant_applications = parsedConsultantApplications;

    job.total_user_applications = applications.length;
    job.total_consultant_applications = parsedConsultantApplications.length;
    job.total_applications = applications.length + parsedConsultantApplications.length;

    return job;
  }

  async getInternshipById(id, useMaster = false) {
    const pool = useMaster ? getWritePool() : getReadPool();
    const [rows] = await pool.execute('SELECT * FROM InternshipJobs WHERE job_id = ?', [id]);
    return rows.length > 0 ? new Internship(rows[0]) : null;
  }

  async updateInternshipById(id, updateData) {
    // Fetch existing job
    const [existingRows] = await getReadPool().execute('SELECT * FROM InternshipJobs WHERE job_id = ?', [id]);
    if (existingRows.length === 0) {
      return null;
    }
    const existingJob = existingRows[0];

    // Merge updateData into existing job
    const updatedJob = {
      ...existingJob,
      ...updateData, // only overwrite fields that are passed
    };

    // Build update query dynamically
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) {
      return new Internship(existingJob); // nothing to update
    }

    values.push(id); // last is the job id

    const sql = `UPDATE InternshipJobs SET ${fields.join(', ')} WHERE job_id = ?`;
    await getWritePool().execute(sql, values);

    // Return updated job
    return new Internship(updatedJob);
  }

  async deleteInternshipById(id) {
    const [result] = await getWritePool().execute('DELETE FROM InternshipJobs WHERE job_id = ?', [id]);
    return result.affectedRows > 0; // true if a row was deleted
  }
}

export default new internshipQueries();
