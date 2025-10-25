import db from '../config/database.js';
import Jobs from '../models/Jobs.model.js';
const pool = db.getPool();

class jobQueries {
  async create(jobsdata) {
    const job = new Jobs(jobsdata);
    const dbObject = job.toDatabaseObject();

    const sql = `
    INSERT INTO HotVacancyJobs (
        company_id, employer_id, staff_id, jobTitle, employmentType, skills,
        CompanyIndustry, workMode, jobLocation, willingToRelocate, locality, 
        experinceFrom, experinceTo, salaryRangeFrom, salaryRangeTo, qualification, 
        jobDescription, AboutCompany, include_walk_in_details, walk_in_start_date,
        walk_in_start_time, walk_in_end_time, contact_person, venue, google_maps_url,
        duration_days, contact_number, questions, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      dbObject.Status,
    ];

    const [result] = await pool.execute(sql, values);

    // Return the complete job using fromDatabaseRow for proper parsing
    return await this.getJobById(result.insertId);
  }
  async getAllJobs(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // paginated jobs
    const [rows] = await pool.query(`SELECT * FROM HotVacancyJobs ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);

    //total jobs
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM HotVacancyJobs`);

    return { jobs: rows, total };
  }

  async getJobById(id) {
    const [rows] = await pool.execute('SELECT * FROM HotVacancyJobs WHERE id = ?', [id]);
    return rows.length > 0 ? new Jobs(rows[0]) : null;
  }

  async updateJobById(id, updateData) {
    // Fetch existing job
    const [existingRows] = await pool.execute('SELECT * FROM HotVacancyJobs WHERE id = ?', [id]);
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

    const sql = `UPDATE HotVacancyJobs SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(sql, values);

    // Return updated job
    return new Jobs(updatedJob);
  }

  async deleteJobById(id) {
    const [result] = await pool.execute('DELETE FROM HotVacancyJobs WHERE id = ?', [id]);
    return result.affectedRows > 0; // true if a row was deleted
  }
}

export default new jobQueries();
