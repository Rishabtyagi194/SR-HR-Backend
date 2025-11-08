import { getReadPool, getWritePool } from '../config/database.js';
import Internship from '../models/internship.model.js';

class internshipQueries {
  async create(jobsdata) {
    const internship = new Internship(jobsdata);
    const dbObject = internship.toDatabaseObject();

    const sql = `
    INSERT INTO InternshipJobs (
      company_id, employer_id, staff_id, internshipTitle, employmentType,
      duration, internshipStartDate, OfferStipend, workMode,
      intershipLocation, willingToRelocate, CompanyIndustry, perksAndBenefit,
      noOfVacancies, skills, qualification, videoProfile, jobDescription,
      lastDateToApply, collabrateWithTeam, receivedResponseOverMail,
      addResponseCode, AboutCompany, postedBy, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      dbObject.company_id,
      dbObject.employer_id,
      dbObject.staff_id,
      dbObject.internshipTitle,
      dbObject.employmentType,
      dbObject.duration,
      dbObject.internshipStartDate,
      dbObject.OfferStipend,
      dbObject.workMode,
      dbObject.intershipLocation,
      dbObject.willingToRelocate,
      dbObject.CompanyIndustry,
      dbObject.perksAndBenefit,
      dbObject.noOfVacancies,
      dbObject.skills,
      dbObject.qualification,
      dbObject.videoProfile,
      dbObject.jobDescription,
      dbObject.lastDateToApply,
      dbObject.collabrateWithTeam,
      dbObject.receivedResponseOverMail,
      dbObject.addResponseCode,
      dbObject.AboutCompany,
      dbObject.postedBy,
      dbObject.Status || 'draft',
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

  async allInternship(page = 1, limit = 10, companyId = null) {
    const offset = (page - 1) * limit;

    let rows, total;

    if (companyId) {
      // Dashboard → only jobs for that organization
      [rows] = await getReadPool().query(
        `SELECT * FROM InternshipJobs 
        WHERE company_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?`,
        [companyId, limit, offset],
      );

      //total jobs
      [[{ total }]] = await getReadPool().execute(
        `
        SELECT COUNT(*) as total FROM InternshipJobs WHERE company_id = ?`,
        [companyId],
      );
    } else {
      // Client side → all jobs

      [rows] = await getReadPool().query(
        `SELECT * FROM InternshipJobs 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      [[{ total }]] = await getReadPool().execute(`SELECT COUNT(*) as total FROM InternshipJobs`);
    }

    return { jobs: rows, total };
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
