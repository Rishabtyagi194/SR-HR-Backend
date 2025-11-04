// src/queries/userQueries.js
import { getReadPool, getWritePool } from '../config/database.js';
import User from '../models/User.model.js';

class UserQueries {
  async create({ full_name, email, password, phone }) {
    const [result] = await getWritePool().execute(
      `INSERT INTO users (full_name, email, password, phone, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [full_name, email, password, phone || null],
    );
    return this.findById(result.insertId, true);
  }

  async findByEmail(email) {
    const [rows] = await getReadPool().execute(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
    return rows.length ? new User(rows[0]) : null;
  }

  async findById(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT 
       u.id, u.full_name, u.email, u.password, u.phone, u.created_at, u.updated_at,
       p.dob, p.gender, p.address, p.city, p.state, p.country, p.pincode, p.profile_completion,
       p.profile_title, p.about_me, p.current_location, p.preferred_location,
       p.total_experience_years, p.total_experience_months, p.notice_period, p.expected_salary,
       p.resume_url, p.resume_public_id
     FROM users u
     LEFT JOIN user_profiles p ON u.id = p.user_id
     WHERE u.id = ? LIMIT 1`,
      [userId],
    );

    return rows.length ? new User(rows[0]) : null;
  }
  //  ---------------------------- Profile ---------------------------

  static async getProfile(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT u.id, u.full_name, u.email, u.phone, u.created_at, u.updated_at,
              up.dob, up.gender, up.address, up.city, up.state, up.country, up.pincode,
              up.profile_completion, up.profile_title, up.about_me, up.current_location,
              up.preferred_location, up.total_experience_years, up.total_experience_months,
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
      (user_id, dob, gender, address, city, state, country, pincode, profile_completion,
       profile_title, about_me, current_location, preferred_location,
       total_experience_years, total_experience_months, notice_period, expected_salary,
       resume_url, resume_public_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        profile.dob || null,
        profile.gender || null,
        profile.address || null,
        profile.city || null,
        profile.state || null,
        profile.country || null,
        profile.pincode || null,
        profile.profile_completion || 0,
        profile.profile_title || null,
        profile.about_me || null,
        profile.current_location || null,
        profile.preferred_location || null,
        profile.total_experience_years || 0,
        profile.total_experience_months || 0,
        profile.notice_period || null,
        profile.expected_salary || null,
        profile.resume_url || null,
        profile.resume_public_id || null,
      ],
    );
    return result.insertId;
  }

  // Update full profile
  async updateProfile(userId, profile = {}) {
    // Filter only allowed columns
    const allowedFields = [
      'dob',
      'gender',
      'address',
      'city',
      'state',
      'country',
      'pincode',
      'profile_completion',
      'profile_title',
      'about_me',
      'current_location',
      'preferred_location',
      'total_experience_years',
      'total_experience_months',
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
      `INSERT INTO user_education (user_id, degree, specialization, institute_name, start_year, end_year, percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        education.degree,
        education.specialization || null,
        education.university || null,
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
      specialization: education.specialization ?? existing.specialization,
      institute_name: education.institute_name ?? existing.institute_name,
      start_year: education.start_year ?? existing.start_year,
      end_year: education.end_year ?? existing.end_year,
      percentage: education.percentage ?? existing.percentage,
    };

    // Perform update
    const [res] = await getWritePool().execute(
      `UPDATE user_education 
     SET degree = ?, specialization = ?, institute_name = ?, start_year = ?, end_year = ?, percentage = ?
     WHERE id = ? AND user_id = ?`,
      [
        updated.degree,
        updated.specialization,
        updated.institute_name,
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
      `INSERT INTO user_experience (user_id, company_name, job_title, start_date, end_date, currently_working, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        exp.company_name,
        exp.job_title,
        exp.start_date || null,
        exp.end_date || null,
        exp.currently_working ? 1 : 0,
        exp.description || null,
      ],
    );
    return true;
  }

  // UPDATE EXPERIENCE
  async updateExperience(userId, expId, exp) {
    console.log('expId', expId);

    const [rows] = await getReadPool().execute(`SELECT * FROM user_experience WHERE id = ? AND user_id = ?`, [expId, userId]);
    if (!rows.length) throw new Error('Experience not found');

    const existing = rows[0];
    const updated = {
      company_name: exp.company_name ?? existing.company_name,
      job_title: exp.job_title ?? existing.job_title,
      start_date: exp.start_date ?? existing.start_date,
      end_date: exp.end_date ?? existing.end_date,
      currently_working: exp.currently_working ?? existing.currently_working,
      description: exp.description ?? existing.description,
    };

    const [res] = await getWritePool().execute(
      `UPDATE user_experience
     SET company_name = ?, job_title = ?, start_date = ?, end_date = ?, currently_working = ?, description = ?
     WHERE id = ? AND user_id = ?`,
      [
        updated.company_name,
        updated.job_title,
        updated.start_date,
        updated.end_date,
        updated.currently_working,
        updated.description,
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
}

export default new UserQueries();
