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
        company_id, employer_id, staff_id, jobTitle, employmentType, skills,
        CompanyIndustry, workMode, jobLocation, willingToRelocate, locality, 
        experinceFrom, experinceTo, salaryRangeFrom, salaryRangeTo, qualification, 
        jobDescription, AboutCompany, include_walk_in_details, walk_in_start_date,
        walk_in_start_time, walk_in_end_time, contact_person, venue, google_maps_url,
        duration_days, contact_number, questions, postedBy, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      dbObject.company_id,
      dbObject.employer_id,
      dbObject.staff_id,
      dbObject.jobTitle,
      dbObject.employmentType,
      dbObject.skills,
      dbObject.CompanyIndustry,
      dbObject.workMode,
      dbObject.jobLocation,
      dbObject.willingToRelocate,
      dbObject.locality,
      dbObject.experinceFrom,
      dbObject.experinceTo,
      dbObject.salaryRangeFrom,
      dbObject.salaryRangeTo,
      dbObject.qualification,
      dbObject.jobDescription,
      dbObject.AboutCompany,
      dbObject.include_walk_in_details,
      dbObject.walk_in_start_date,
      dbObject.walk_in_start_time,
      dbObject.walk_in_end_time,
      dbObject.contact_person,
      dbObject.venue,
      dbObject.google_maps_url,
      dbObject.duration_days,
      dbObject.contact_number,
      dbObject.questions,
      dbObject.postedBy,
      dbObject.Status || 'draft',
    ];

    // console.log('FINAL Status before insert:', dbObject.Status);
    const [result] = await getWritePool().execute(sql, values);

    // Return the complete job using fromDatabaseRow for proper parsing
    return await this.getJobById(result.insertId);
  }

  async getAllJobs(page = 1, limit = 10, companyId = null, includeApplications = false) {
    const offset = (page - 1) * limit;

    let rows, total;

    if (companyId) {
      [rows] = await getReadPool().query(
        `SELECT * FROM HotVacancyJobs 
         WHERE company_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [companyId, limit, offset],
      );

      [[{ total }]] = await getReadPool().execute(
        `
        SELECT COUNT(*) as total FROM HotVacancyJobs WHERE company_id = ?`,
        [companyId],
      );
    } else {
      [rows] = await getReadPool().query(
        `SELECT * FROM HotVacancyJobs 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      [[{ total }]] = await getReadPool().execute(`SELECT COUNT(*) as total FROM HotVacancyJobs`);
    }

    // attach total responses
    if (includeApplications && rows.length > 0) {
      const jobIds = rows.map((j) => j.job_id);
      const [counts] = await getReadPool().query(jobApplicationQueries.getApplicationsCountByJobIds, [jobIds]);

      // convert to map for fast lookup
      const countMap = {};
      for (const c of counts) countMap[c.job_id] = c.total_applications;

      // attach counts
      for (const job of rows) {
        job.total_applications = countMap[job.job_id] || 0;
      }
    }

    return { jobs: rows, total };
  }

  async getJobWithApplications(jobId, companyId = null) {
    // fetch job
    const [jobRows] = companyId
      ? await getReadPool().query(`SELECT * FROM HotVacancyJobs WHERE job_id = ? AND company_id = ?`, [jobId, companyId])
      : await getReadPool().query(`SELECT * FROM HotVacancyJobs WHERE job_id = ?`, [jobId]);

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

    job.applications = applications;
    job.total_applications = applications.length;

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
