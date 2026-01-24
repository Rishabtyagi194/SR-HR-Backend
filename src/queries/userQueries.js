// src/queries/userQueries.js
import { getReadPool, getWritePool } from '../config/database.js';
import User from '../models/User.model.js';
import { saveSearchKeyword } from '../services/searchKeywordService.js';

class UserQueries {
  async findByEmail(email) {
    const [rows] = await getReadPool().execute(
      `SELECT id, full_name, email, password, phone, is_mobile_verified, is_email_verified, role, is_active, created_at, updated_at 
     FROM users 
     WHERE email = ? 
     LIMIT 1`,
      [email],
    );
    return rows.length ? new User(rows[0]) : null;
  }

  async findById(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT 
       u.id, u.full_name, u.email, u.password, u.phone, u.profile_image_url, u.profile_image_public_id, u.work_status, u.total_experience_years, u.total_experience_months, u.current_salary_currency, u.current_salary, u.salary_breakdown,
       u.current_location_country, u.current_location, u.availability_to_join, u.Expected_last_working_day, u.is_active, u.is_mobile_verified, u.is_email_verified, u.created_at, u.updated_at,
       up.gender, up.marital_status , up.dob, up.category, up.work_permit_for_usa, up.Work_permit_for_other_countries, up.permanent_address, up.hometown, up.pincode, up.profile_title, up.resume_headline, up.profile_summary,  
       up.profile_completion, up.disability_status, up.key_skills, up.preferred_location, up.willingToRelocate,
       up.notice_period, up.expected_salary, up.resume_url, up.resume_public_id
     FROM users u
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = ? LIMIT 1`,
      [userId],
    );

    return rows.length ? new User(rows[0]) : null;
  }
  //  ---------------------------- Profile ---------------------------

  static async getProfile(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT u.id, u.full_name, u.email, u.phone, u.profile_image_url, u.profile_image_public_id, u.work_status, u.current_location_country, u.availability_to_join, u.created_at, u.updated_at,
       up.gender, up.marital_status , up.dob, up.category, up.work_permit_for_usa, up.Work_permit_for_other_countries, up.permanent_address, up.hometown, up.pincode, up.profile_title, up.resume_headline, up.profile_summary,  
       up.profile_completion, up.disability_status, up.key_skills, up.preferred_location, up.willingToRelocate,
       up.notice_period, up.expected_salary, up.resume_url, up.resume_public_id
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId],
    );
    return rows[0] || null;
  }

  // Create full profile
  async createProfile(userId, profile = {}) {
    const [result] = await getWritePool().execute(
      `INSERT INTO user_profiles
      (user_id, gender, marital_status, dob, category, work_permit_for_usa, Work_permit_for_other_countries, permanent_address, hometown, pincode, profile_title, resume_headline, profile_summary,
       profile_completion, disability_status, key_skills, preferred_location, willingToRelocate,
       notice_period, expected_salary, resume_url, resume_public_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        profile.gender || null,
        profile.marital_status || null,
        profile.dob || null,
        profile.category || null,
        profile.work_permit_for_usa || null,
        profile.Work_permit_for_other_countries || null,
        profile.permanent_address || null,
        profile.hometown || null,
        profile.pincode || null,

        profile.profile_title || null,
        profile.resume_headline || null,
        profile.profile_summary || null,

        profile.profile_completion || 0,
        profile.disability_status || 0,

        profile.key_skills || null,

        profile.preferred_location || null,
        profile.willingToRelocate || flase,

        profile.notice_period || null,
        profile.expected_salary || null,

        profile.resume_url || null,
        profile.resume_public_id || null,
      ],
    );

    // Save into Redis + DB
    if (profile.profile_title) {
      await saveSearchKeyword(userId, profile.profile_title);
    }
    return result.insertId;
  }

  // Update Basic profiles
  async updateBasicProfile(userId, profile = {}) {
    // Filter only allowed columns
    const allowedFields = [
      'full_name',
      'profile_image_url',
      'profile_image_public_id',
      'work_status',
      'total_experience_years',
      'total_experience_months',
      'current_salary_currency',
      'current_salary',
      'salary_breakdown',
      'current_location_country',
      'current_location',
      'phone',
      'email',
      'availability_to_join',
      'Expected_last_working_day',
    ];

    // Build dynamic SET clause
    const fields = [];
    const values = [];

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(profile, key)) {
        fields.push(`${key} = ?`);
        values.push(profile[key]);
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const sql = `
    UPDATE users 
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = ?
  `;
    values.push(userId);

    const [res] = await getWritePool().execute(sql, values);
    return res.affectedRows > 0;
  }

  // get basic profile
  async getBasicById(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT 
      id, full_name, email, phone,
      profile_image_url, profile_image_public_id,
      work_status, total_experience_years, total_experience_months,
      current_location_country, current_location,
      availability_to_join, Expected_last_working_day
     FROM users WHERE id = ?`,
      [userId],
    );
    return rows[0];
  }

  // Update full profiles
  async updatePersonalDetails(userId, profile = {}) {
    // Filter only allowed columns
    const allowedFields = [
      'gender',
      'marital_status',
      'dob',
      'category',
      'work_permit_for_usa',
      'Work_permit_for_other_countries',
      'permanent_address',
      'hometown',
      'pincode',

      'profile_title',
      'resume_headline',
      'profile_summary',
      'profile_completion',
      'disability_status',
      'key_skills',

      'preferred_location',
      'willingToRelocate',

      'notice_period',
      'expected_salary',
      'resume_url',
    ];

    // Build dynamic SET clause
    const fields = [];
    const values = [];

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(profile, key)) {
        fields.push(`${key} = ?`);
        values.push(profile[key]);
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const sql = `
    UPDATE user_profiles 
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE user_id = ?
  `;
    values.push(userId);

    const [res] = await getWritePool().execute(sql, values);
    return res.affectedRows > 0;
  }

  async getPersonalDetailsById(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT 
        user_id, gender, marital_status, dob,
        category, work_permit_for_usa, Work_permit_for_other_countries,
        permanent_address, hometown, pincode,
        profile_title, resume_headline, profile_summary,
        profile_completion, disability_status, key_skills, preferred_location,
        willingToRelocate, notice_period, expected_salary, resume_url, resume_public_id
      FROM user_profiles WHERE user_id = ?`,
      [userId],
    );
    return rows[0];
  }

  //  ---------------------------- Educations ---------------------------

  // async updateProfile(userId, profile = {}) {
  //   const [res] = await getWritePool().execute(
  //     `UPDATE user_profiles
  //    SET dob = ?, gender = ?, address = ?, city = ?, state = ?, country = ?, pincode = ?, profile_completion = ?,
  //        profile_title = ?, about_me = ?, current_location = ?, preferred_location = ?,
  //        total_experience_years = ?, total_experience_months = ?, notice_period = ?, expected_salary = ?,
  //        resume_url = ?, updated_at = NOW()
  //    WHERE user_id = ?`,
  //     [
  //       profile.dob,
  //       profile.gender,
  //       profile.address,
  //       profile.city,
  //       profile.state,
  //       profile.country,
  //       profile.pincode,
  //       profile.profile_completion,
  //       profile.profile_title,
  //       profile.about_me,
  //       profile.current_location,
  //       profile.preferred_location,
  //       profile.total_experience_years,
  //       profile.total_experience_months,
  //       profile.notice_period,
  //       profile.expected_salary,
  //       profile.resume_url,
  //       userId,
  //     ],
  //   );
  //   return res.affectedRows;
  // }

  //add education
  async addEducation(userId, education) {
    await getWritePool().execute(
      `INSERT INTO user_education (user_id, degree, institute_name, specialization, course_type, start_year, end_year, percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        education.degree || null,
        education.institute_name || null,
        education.specialization || null,
        education.course_type || null,
        education.start_year || null,
        education.end_year || null,
        education.percentage || null,
      ],
    );
    return true;
  }

  //  update education
  async updateEducation(userId, eduId, education) {
    // Get current record first
    const [rows] = await getReadPool().execute(`SELECT * FROM user_education WHERE id = ? AND user_id = ?`, [eduId, userId]);
    if (!rows.length) throw new Error('Education not found');

    const existing = rows[0];

    // Merge old and new data
    const updated = {
      degree: education.degree ?? existing.degree,
      institute_name: education.institute_name ?? existing.institute_name,
      specialization: education.specialization ?? existing.specialization,
      course_type: education.course_type ?? existing.course_type,
      start_year: education.start_year ?? existing.start_year,
      end_year: education.end_year ?? existing.end_year,
      percentage: education.percentage ?? existing.percentage,
    };

    // Perform update
    const [res] = await getWritePool().execute(
      `UPDATE user_education 
     SET degree = ?, institute_name = ?, specialization = ?, course_type = ?, start_year = ?, end_year = ?, percentage = ?
     WHERE id = ? AND user_id = ?`,
      [
        updated.degree,
        updated.institute_name,
        updated.specialization,
        updated.course_type,
        updated.start_year,
        updated.end_year,
        updated.percentage,
        eduId,
        userId,
      ],
    );

    return res.affectedRows;
  }

  // List helpers (with pagination)
  async listEducations(userId) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_education WHERE user_id = ? ORDER BY end_year DESC`, [userId]);
    return rows;
  }

  //  ---------------------------- experience ---------------------------

  // ADD EXPERINCE
  async addExperience(userId, exp) {
    await getWritePool().execute(
      `INSERT INTO user_experience (user_id, is_current_employment, employment_type, total_exp_year, total_exp_months, company_name, job_title, joining_date_year, joining_date_months, salary_currency, current_salary, skills_used, department, industry, job_profile, notice_period, Expected_last_working_day, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        exp.is_current_employment ? 1 : 0,
        exp.employment_type || null,
        exp.total_exp_year || null,
        exp.total_exp_months || null,

        exp.company_name || null,
        exp.job_title || null,
        exp.joining_date_year || null,
        exp.joining_date_months || null,

        exp.salary_currency || null,
        exp.current_salary || null,

        exp.skills_used || null,

        exp.department || null,
        exp.industry || null,

        exp.job_profile || null,
        exp.notice_period || null,
        exp.Expected_last_working_day || null,

        exp.start_date || null,
        exp.end_date || null,
      ],
    );
    return true;
  }

  // UPDATE EXPERIENCE
  async updateExperience(userId, expId, exp) {
    // console.log('expId', expId);

    const [rows] = await getReadPool().execute(`SELECT * FROM user_experience WHERE id = ? AND user_id = ?`, [expId, userId]);
    if (!rows.length) throw new Error('Experience not found');

    const existing = rows[0];
    const updated = {
      is_current_employment: exp.is_current_employment ?? existing.is_current_employment,
      employment_type: exp.employment_type ?? existing.employment_type,
      total_exp_year: exp.total_exp_year ?? existing.total_exp_year,
      total_exp_months: exp.total_exp_months ?? existing.total_exp_months,

      company_name: exp.company_name ?? existing.company_name,
      job_title: exp.job_title ?? existing.job_title,
      joining_date_year: exp.joining_date_year ?? existing.joining_date_year,
      joining_date_months: exp.joining_date_months ?? existing.joining_date_months,

      salary_currency: exp.salary_currency ?? existing.salary_currency,
      current_salary: exp.current_salary ?? existing.current_salary,
      skills_used: exp.skills_used ?? existing.skills_used,
      department: exp.department ?? existing.department,
      industry: exp.industry ?? existing.industry,

      job_profile: exp.job_profile ?? existing.job_profile,
      notice_period: exp.notice_period ?? existing.notice_period,
      Expected_last_working_day: exp.Expected_last_working_day ?? existing.Expected_last_working_day,

      start_date: exp.start_date ?? existing.start_date,
      end_date: exp.end_date ?? existing.end_date,
    };

    const [res] = await getWritePool().execute(
      `UPDATE user_experience
     SET is_current_employment = ?, employment_type = ?, total_exp_year = ?, total_exp_months = ?, company_name = ?, 
     job_title = ?, joining_date_year = ?, joining_date_months = ?, salary_currency = ?, current_salary = ?, skills_used = ?, 
     department = ?, industry = ?, job_profile = ?, notice_period = ?, Expected_last_working_day = ?, start_date = ?, end_date = ?
     WHERE id = ? AND user_id = ?`,
      [
        updated.is_current_employment,
        updated.employment_type,
        updated.total_exp_year,
        updated.total_exp_months,
        updated.company_name,
        updated.job_title,
        updated.joining_date_year,
        updated.joining_date_months,
        updated.salary_currency,
        updated.current_salary,
        updated.skills_used,
        updated.department,
        updated.industry,
        updated.job_profile,
        updated.notice_period,
        updated.Expected_last_working_day,
        updated.start_date,
        updated.end_date,
        expId,
        userId,
      ],
    );

    return res.affectedRows;
  }

  // All Experience
  async listExperiences(userId) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_experience WHERE user_id = ? ORDER BY start_date DESC`, [userId]);
    return rows;
  }
  //  ---------------------------- Skills ---------------------------

  // ADD SINGLE OR MULTIPLE SKILLS
  async addSkill(userId, skills) {
    // If a single skill is provided (not array), wrap it in an array
    const skillArray = Array.isArray(skills) ? skills : [skills];

    // Validate
    if (!skillArray.length) throw new Error('No skills provided');

    // Prepare data for bulk insert
    const values = skillArray.map((skill) => [userId, skill.skill_name, skill.proficiency_level || null]);

    // Perform bulk insert
    await getWritePool().query(
      `INSERT INTO user_skills (user_id, skill_name, proficiency_level)
     VALUES ?`,
      [values],
    );

    return { inserted: values.length };
  }

  // UPDATE SKILL (only 1 skill at a time)
  async updateSkill(userId, skillId, skill) {
    console.log(`Updating skill → userId: ${userId}, skillId: ${skillId}`);
    console.log('Incoming skill data:', skill);

    const [rows] = await getReadPool().execute(`SELECT * FROM user_skills WHERE id = ? AND user_id = ?`, [skillId, userId]);
    console.log('Existing record:', rows);

    if (!rows.length) throw new Error('Skill not found');

    const existing = rows[0];
    const updated = {
      skill_name: skill.skill_name ?? existing.skill_name,
      proficiency_level: skill.proficiency_level ?? existing.proficiency_level,
    };

    const [res] = await getWritePool().execute(
      `UPDATE user_skills
     SET skill_name = ?, proficiency_level = ?
     WHERE id = ? AND user_id = ?`,
      [updated.skill_name, updated.proficiency_level, skillId, userId],
    );

    console.log('Update result:', res);

    return res.affectedRows > 0;
  }

  async listSkills(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT id, skill_name, proficiency_level FROM user_skills WHERE user_id = ? ORDER BY id DESC`,
      [userId],
    );
    return rows;
  }

  /* -------------------------- PROJECTS -------------------------- */

  // ADD SINGLE OR MULTIPLE PROJECTS
  async addProject(userId, projects) {
    const projectArray = Array.isArray(projects) ? projects : [projects];
    if (!projectArray.length) throw new Error('No projects provided');

    const values = projectArray.map((p) => [
      userId,
      p.project_title,
      p.client,
      p.project_status,
      p.work_from_year,
      p.work_from_month,
      p.work_to_year,
      p.work_to_month,
      p.project_details,
    ]);

    await getWritePool().query(
      `INSERT INTO user_projects
     (user_id, project_title, client, project_status,
      work_from_year, work_from_month, work_to_year, work_to_month, project_details)
     VALUES ?`,
      [values],
    );

    return { inserted: values.length };
  }

  // UPDATE PROJECT
  async updateProject(userId, projectId, project) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_projects WHERE id = ? AND user_id = ?`, [projectId, userId]);

    if (!rows.length) throw new Error('Project not found');

    const existing = rows[0];

    const updated = {
      project_title: project.project_title ?? existing.project_title,
      client: project.client ?? existing.client,
      project_status: project.project_status ?? existing.project_status,
      work_from_year: project.work_from_year ?? existing.work_from_year,
      work_from_month: project.work_from_month ?? existing.work_from_month,
      work_to_year: project.work_to_year ?? existing.work_to_year,
      work_to_month: project.work_to_month ?? existing.work_to_month,
      project_details: project.project_details ?? existing.project_details,
    };

    const [res] = await getWritePool().execute(
      `UPDATE user_projects SET
      project_title = ?, client = ?, project_status = ?,
      work_from_year = ?, work_from_month = ?,
      work_to_year = ?, work_to_month = ?,
      project_details = ?
     WHERE id = ? AND user_id = ?`,
      [
        updated.project_title,
        updated.client,
        updated.project_status,
        updated.work_from_year,
        updated.work_from_month,
        updated.work_to_year,
        updated.work_to_month,
        updated.project_details,
        projectId,
        userId,
      ],
    );

    return res.affectedRows > 0;
  }

  // LIST PROJECTS
  async listProjects(userId) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_projects WHERE user_id = ? ORDER BY id DESC`, [userId]);
    return rows;
  }

  // DELETE PROJECT
  async deleteProject(userId, projectId) {
    const [res] = await getWritePool().execute(`DELETE FROM user_projects WHERE id = ? AND user_id = ?`, [projectId, userId]);
    return res.affectedRows > 0;
  }

  /* ---------------------- ACCOMPLISHMENTS ---------------------- */

  /* -------  Social Profile ------- */

  // add
  async addSocialProfile(userId, data) {
    const [res] = await getWritePool().execute(
      `INSERT INTO user_social_profiles
     (user_id, social_profile, social_profile_url, social_profile_description)
     VALUES (?,?,?,?)`,
      [userId, data.social_profile, data.social_profile_url, data.social_profile_description],
    );
    return res.insertId;
  }

  // list all
  async listSocialProfiles(userId) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_social_profiles WHERE user_id = ? ORDER BY id DESC`, [userId]);
    return rows;
  }

  //  update
  async updateSocialProfile(userId, id, data) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_social_profiles WHERE id = ? AND user_id = ?`, [id, userId]);
    if (!rows.length) throw new Error('Social profile not found');

    const existing = rows[0];

    const [res] = await getWritePool().execute(
      `UPDATE user_social_profiles SET
      social_profile = ?,
      social_profile_url = ?,
      social_profile_description = ?
     WHERE id = ? AND user_id = ?`,
      [
        data.social_profile ?? existing.social_profile,
        data.social_profile_url ?? existing.social_profile_url,
        data.social_profile_description ?? existing.social_profile_description,
        id,
        userId,
      ],
    );

    return res.affectedRows > 0;
  }

  //  delete
  async deleteSocialProfile(userId, id) {
    const [res] = await getWritePool().execute(`DELETE FROM user_social_profiles WHERE id = ? AND user_id = ?`, [id, userId]);
    return res.affectedRows > 0;
  }

  /* -------  Work sample ------- */

  // add
  async addWorkSample(userId, data) {
    // console.log("data", data);

    const payload = {
      work_sample_title: data.work_sample_title ?? null,
      work_sample_url: data.work_sample_url ?? null,
      work_sample_description: data.work_sample_description ?? null,
      work_from_year: data.work_from_year ?? null,
      work_from_month: data.work_from_month ?? null,
      work_to_year: data.work_to_year ?? null,
      work_to_month: data.work_to_month ?? null,
      currently_working: data.currently_working ?? false,
    };

    const [res] = await getWritePool().execute(
      `INSERT INTO user_work_samples
     (user_id, work_sample_title, work_sample_url, work_sample_description,
      work_from_year, work_from_month, work_to_year, work_to_month, currently_working)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        payload.work_sample_title,
        payload.work_sample_url,
        payload.work_sample_description,
        payload.work_from_year,
        payload.work_from_month,
        payload.work_to_year,
        payload.work_to_month,
        payload.currently_working,
      ],
    );

    return res.insertId;
  }

  // list all
  async listWorkSamples(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT * FROM user_work_samples
     WHERE user_id = ?
     ORDER BY id DESC`,
      [userId],
    );

    return rows;
  }

  // update
  async updateWorkSample(userId, id, data) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_work_samples WHERE id = ? AND user_id = ?`, [id, userId]);
    if (!rows.length) throw new Error('Work sample not found');

    const existing = rows[0];

    const [res] = await getWritePool().execute(
      `UPDATE user_work_samples SET
      work_sample_title = ?,
      work_sample_url = ?,
      work_sample_description = ?,
      work_from_year = ?,
      work_from_month = ?,
      work_to_year = ?,
      work_to_month = ?,
      currently_working = ?
     WHERE id = ? AND user_id = ?`,
      [
        data.work_sample_title ?? existing.work_sample_title,
        data.work_sample_url ?? existing.work_sample_url,
        data.work_sample_description ?? existing.work_sample_description,
        data.work_from_year ?? existing.work_from_year,
        data.work_from_month ?? existing.work_from_month,
        data.work_to_year ?? existing.work_to_year,
        data.work_to_month ?? existing.work_to_month,
        data.currently_working ?? existing.currently_working,
        id,
        userId,
      ],
    );

    return res.affectedRows > 0;
  }

  // delete
  async deleteWorkSample(userId, id) {
    const [res] = await getWritePool().execute(`DELETE FROM user_work_samples WHERE id = ? AND user_id = ?`, [id, userId]);
    return res.affectedRows > 0;
  }

  /* -------  Certificate ------- */

  // add
  async addCertification(userId, data) {
    const [res] = await getWritePool().execute(
      `INSERT INTO user_certifications
     (user_id, certification_name, certification_completion_id, certification_url,
      validity_from_month, validity_from_year, validity_to_month, validity_to_year,
      certificate_does_not_expire)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.certification_name,
        data.certification_completion_id,
        data.certification_url,
        data.validity_from_month,
        data.validity_from_year,
        data.validity_to_month,
        data.validity_to_year,
        data.certificate_does_not_expire || false,
      ],
    );
    return res.insertId;
  }

  // list all
  async listCertifications(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT * FROM user_certifications
        WHERE user_id = ?
        ORDER BY id DESC`,
      [userId],
    );
    return rows;
  }

  // update
  async updateCertification(userId, id, data) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_certifications WHERE id = ? AND user_id = ?`, [id, userId]);
    if (!rows.length) throw new Error('Certification not found');

    const existing = rows[0];

    const [res] = await getWritePool().execute(
      `UPDATE user_certifications SET
      certification_name = ?,
      certification_completion_id = ?,
      certification_url = ?,
      validity_from_month = ?,
      validity_from_year = ?,
      validity_to_month = ?,
      validity_to_year = ?,
      certificate_does_not_expire = ?
     WHERE id = ? AND user_id = ?`,
      [
        data.certification_name ?? existing.certification_name,
        data.certification_completion_id ?? existing.certification_completion_id,
        data.certification_url ?? existing.certification_url,
        data.validity_from_month ?? existing.validity_from_month,
        data.validity_from_year ?? existing.validity_from_year,
        data.validity_to_month ?? existing.validity_to_month,
        data.validity_to_year ?? existing.validity_to_year,
        data.certificate_does_not_expire ?? existing.certificate_does_not_expire,
        id,
        userId,
      ],
    );

    return res.affectedRows > 0;
  }

  // delete
  async deleteCertification(userId, id) {
    const [res] = await getWritePool().execute(`DELETE FROM user_certifications WHERE id = ? AND user_id = ?`, [id, userId]);
    return res.affectedRows > 0;
  }
}

export default new UserQueries();
