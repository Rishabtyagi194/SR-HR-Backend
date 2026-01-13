// queries/hotVacancyQueries.js

import { getReadPool, getWritePool } from '../config/database.js';
import Jobs from '../models/hotVacancyJobs.model.js';
import { jobApplicationQueries } from './jobApplicationQueries.js';

class jobQueries {
  async create(jobsdata) {
    const job = new Jobs(jobsdata);
    const dbObject = job.toDatabaseObject();

    // console.log('jobsData', job);
    // console.log('dbObject', dbObject.Status);

    const sql = `
    INSERT INTO HotVacancyJobs (
        organisation_id, employer_id, staff_id, jobTitle, employmentType, skills,
        CompanyIndustry, workMode, jobLocation, willingToRelocate, locality, 
        experinceFrom, experinceTo, salaryRangeFrom, salaryRangeTo, qualification, 
        jobDescription, AboutCompany, include_walk_in_details, walk_in_start_date,
        walk_in_start_time, walk_in_end_time, contact_person, venue, google_maps_url,
        duration_days, contact_number, questions, posted_by_email, postedBy, is_consultant_Job_Active, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // const values = [
    //   dbObject.organisation_id,
    //   dbObject.consultant_agency_id,
    //   dbObject.employer_id,
    //   dbObject.staff_id,
    //   dbObject.consultant_user_id,
    //   dbObject.jobTitle,
    //   dbObject.employmentType,
    //   dbObject.skills,
    //   dbObject.CompanyIndustry,
    //   dbObject.workMode,
    //   dbObject.jobLocation,
    //   dbObject.willingToRelocate,
    //   dbObject.locality,
    //   dbObject.experinceFrom,
    //   dbObject.experinceTo,
    //   dbObject.salaryRangeFrom,
    //   dbObject.salaryRangeTo,
    //   dbObject.qualification,
    //   dbObject.jobDescription,
    //   dbObject.AboutCompany,
    //   dbObject.include_walk_in_details,
    //   dbObject.walk_in_start_date,
    //   dbObject.walk_in_start_time,
    //   dbObject.walk_in_end_time,
    //   dbObject.contact_person,
    //   dbObject.venue,
    //   dbObject.google_maps_url,
    //   dbObject.duration_days,
    //   dbObject.contact_number,
    //   dbObject.questions,
    //   dbObject.postedBy,
    //   dbObject.Status || 'draft',
    // ];

    // console.log('FINAL Status before insert:', dbObject.Status);

    const values = [
      dbObject.organisation_id ?? null,
      dbObject.employer_id ?? null,
      dbObject.staff_id ?? null,

      dbObject.jobTitle ?? null,
      dbObject.employmentType ?? null,
      JSON.stringify(dbObject.skills ?? []),
      dbObject.CompanyIndustry ?? null,
      dbObject.workMode ?? null,
      JSON.stringify(dbObject.jobLocation ?? []),
      dbObject.willingToRelocate ?? false,
      dbObject.locality ?? null,

      dbObject.experinceFrom ?? null,
      dbObject.experinceTo ?? null,
      dbObject.salaryRangeFrom ?? null,
      dbObject.salaryRangeTo ?? null,
      JSON.stringify(dbObject.qualification ?? []),

      dbObject.jobDescription ?? null,
      dbObject.AboutCompany ?? null,

      dbObject.include_walk_in_details ?? false,
      dbObject.walk_in_start_date ?? null,
      dbObject.walk_in_start_time ?? null,
      dbObject.walk_in_end_time ?? null,
      dbObject.contact_person ?? null,
      dbObject.venue ?? null,
      dbObject.google_maps_url ?? null,

      dbObject.duration_days ?? 1,
      dbObject.contact_number ?? null,
      JSON.stringify(dbObject.questions ?? []),

      dbObject.posted_by_email,
      dbObject.postedBy,
      dbObject.is_consultant_Job_Active ?? false,
      dbObject.Status ?? 'draft',
    ];

    if (values.includes(undefined)) {
      console.error('Undefined value found in insert:', values);
      throw new Error('One or more required fields are undefined');
    }
    const [result] = await getWritePool().execute(sql, values);

    // Return the complete job using fromDatabaseRow for proper parsing
    return await this.getJobById(result.insertId);
  }

  // async getAllJobs(page = 1, limit = 10, organisationId = null, role = null) {
  //   const offset = (page - 1) * limit;

  //   let rows, total;

  //   if (organisationId) {
  //     [rows] = await getReadPool().query(
  //       `SELECT * FROM HotVacancyJobs
  //        WHERE organisation_id = ?
  //        ORDER BY created_at DESC
  //        LIMIT ? OFFSET ?`,
  //       [organisationId, limit, offset],
  //     );

  //     [[{ total }]] = await getReadPool().execute(
  //       `
  //       SELECT COUNT(*) as total FROM HotVacancyJobs WHERE organisation_id = ?`,
  //       [organisationId],
  //     );
  //   } else {
  //     // Client side all jobs
  //     [rows] = await getReadPool().query(
  //       `
  //     SELECT * FROM HotVacancyJobs
  //     WHERE LOWER(Status) = 'active'
  //     ORDER BY created_at DESC
  //     LIMIT ? OFFSET ?
  //     `,
  //       [limit, offset],
  //     );

  //     [[{ total }]] = await getReadPool().execute(
  //       `
  //     SELECT COUNT(*) AS total
  //     FROM HotVacancyJobs
  //     WHERE Status = 'active'
  //     `,
  //     );
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

  // async getAllJobs(page = 1, limit = 10, organisationId = null, role = null) {
  //   const offset = (page - 1) * limit;
  //   let rows, total;

  //   // ===============================
  //   // EMPLOYER / CONSULTANT DASHBOARD
  //   // ===============================
  //   if (organisationId && role !== 'job_seeker') {
  //     [rows] = await getReadPool().query(
  //       `
  //     SELECT *
  //     FROM HotVacancyJobs
  //     WHERE organisation_id = ?
  //     ORDER BY created_at DESC
  //     LIMIT ? OFFSET ?
  //     `,
  //       [organisationId, limit, offset],
  //     );

  //     [[{ total }]] = await getReadPool().execute(
  //       `
  //     SELECT COUNT(*) AS total
  //     FROM HotVacancyJobs
  //     WHERE organisation_id = ?
  //     `,
  //       [organisationId],
  //     );

  //     return { jobs: rows, total };
  //   }

  //   // ===============================
  //   // JOB SEEKER (PUBLIC USER)
  //   // ===============================
  //   if (role === 'job_seeker') {
  //     [rows] = await getReadPool().query(
  //       `
  //     SELECT *
  //     FROM HotVacancyJobs
  //     WHERE Status = 'active'
  //       AND (
  //         postedBy = 'company'
  //         OR postedBy = 'consultant'
  //       )
  //     ORDER BY created_at DESC
  //     LIMIT ? OFFSET ?
  //     `,
  //       [limit, offset],
  //     );

  //     [[{ total }]] = await getReadPool().execute(
  //       `
  //     SELECT COUNT(*) AS total
  //     FROM HotVacancyJobs
  //     WHERE Status = 'active'
  //       AND (
  //         postedBy = 'company'
  //         OR postedBy = 'consultant'
  //       )
  //     `,
  //     );

  //     return { jobs: rows, total };
  //   }

  //   // ===============================
  //   // CONSULTANT (PUBLIC + OWN)
  //   // ===============================
  //   if (role === 'consultant_admin') {
  //     [rows] = await getReadPool().query(
  //       `
  //     SELECT *
  //     FROM HotVacancyJobs
  //     WHERE Status = 'active'
  //       AND (
  //         postedBy = 'consultant'
  //         OR (postedBy = 'company' AND is_consultant_Job_Active = 1)
  //       )
  //     ORDER BY created_at DESC
  //     LIMIT ? OFFSET ?
  //     `,
  //       [limit, offset],
  //     );

  //     [[{ total }]] = await getReadPool().execute(
  //       `
  //     SELECT COUNT(*) AS total
  //     FROM HotVacancyJobs
  //     WHERE Status = 'active'
  //       AND (
  //         postedBy = 'consultant'
  //         OR (postedBy = 'company' AND is_consultant_Job_Active = 1)
  //       )
  //     `,
  //     );

  //     return { jobs: rows, total };
  //   }

  //   return { jobs: [], total: 0 };
  // }

  async getDashboardJobs(page, limit, role, organisationId, userId) {
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
    FROM HotVacancyJobs
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
      [...params, limit, offset],
    );

    const [[{ total }]] = await getReadPool().execute(
      `
    SELECT COUNT(*) AS total
    FROM HotVacancyJobs
    WHERE ${where}
    `,
      params,
    );

    return { jobs: rows, total };
  }

  async getPublicJobs(page, limit, role) {
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
    FROM HotVacancyJobs
    WHERE ${condition}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    const [[{ total }]] = await getReadPool().execute(
      `
    SELECT COUNT(*) AS total
    FROM HotVacancyJobs
    WHERE ${condition}
    `,
    );

    return { jobs: rows, total };
  }

  async getJobWithApplications(jobId, organisationId = null) {
    // fetch job
    const [jobRows] = organisationId
      ? await getReadPool().query(`SELECT * FROM HotVacancyJobs WHERE job_id = ? AND organisation_id = ?`, [jobId, organisationId])
      : await getReadPool().query(`SELECT * FROM HotVacancyJobs WHERE job_id = ?`, [jobId]);

    // console.log("jobRows", jobRows);

    if (!jobRows.length) return null;
    const job = jobRows[0];

    // fetch applications + user data
    const [applications] = await getReadPool().query(jobApplicationQueries.getApplicationsWithFullUserDataByHotVacancyJobId, [jobId]);

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

      app.profile = { educations, experiences, skills };
    }

    // CONSULTANT applications
    const [consultantApplications] = await getReadPool().query(jobApplicationQueries.getConsultantApplicationsByHotVacancyJobId, [
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

  async getJobById(id, useMaster = false) {
    const pool = useMaster ? getWritePool() : getReadPool();
    const [rows] = await pool.execute('SELECT * FROM HotVacancyJobs WHERE job_id = ?', [id]);
    return rows.length > 0 ? new Jobs(rows[0]) : null;
  }

  async updateJobById(id, updateData) {
    // Fetch existing job
    const [existingRows] = await getReadPool().execute('SELECT * FROM HotVacancyJobs WHERE job_id = ?', [id]);
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
      return new Jobs(existingJob); // nothing to update
    }

    values.push(id); // last is the job id

    const sql = `UPDATE HotVacancyJobs SET ${fields.join(', ')} WHERE job_id = ?`;
    await getWritePool().execute(sql, values);

    // Return updated job
    return new Jobs(updatedJob);
  }

  async deleteJobById(id) {
    const [result] = await getWritePool().execute('DELETE FROM HotVacancyJobs WHERE job_id = ?', [id]);
    return result.affectedRows > 0; // true if a row was deleted
  }
}

export default new jobQueries();
