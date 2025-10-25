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
       p.resume_url
     FROM users u
     LEFT JOIN user_profiles p ON u.id = p.user_id
     WHERE u.id = ? LIMIT 1`,
      [userId],
    );

    return rows.length ? new User(rows[0]) : null;
  }

  static async getProfile(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT u.id, u.full_name, u.email, u.phone, u.created_at, u.updated_at,
              up.dob, up.gender, up.address, up.city, up.state, up.country, up.pincode,
              up.profile_completion, up.profile_title, up.about_me, up.current_location,
              up.preferred_location, up.total_experience_years, up.total_experience_months,
              up.notice_period, up.expected_salary, up.resume_url
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId],
    );
    return rows[0] || null;
  }

  //   async findById(userId) {
  //     const [rows] = await pool.execute(
  //       `SELECT u.*, p.dob, p.gender, p.city, p.state, p.country, p.resume_url, p.about_me, p.profile_completion
  //        FROM users u
  //        LEFT JOIN user_profiles p ON u.user_id = p.user_id
  //        WHERE u.user_id = ? LIMIT 1`,
  //       [userId],
  //     );
  //     return rows.length ? new User(rows[0]) : null;
  //   }

  // Create full profile
  async createProfile(userId, profile = {}) {
    const [result] = await getWritePool().execute(
      `INSERT INTO user_profiles
      (user_id, dob, gender, address, city, state, country, pincode, profile_completion,
       profile_title, about_me, current_location, preferred_location,
       total_experience_years, total_experience_months, notice_period, expected_salary,
       resume_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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
      ],
    );
    return result.insertId;
  }

  // Update full profile
  async updateProfile(userId, profile = {}) {
    const [res] = await getWritePool().execute(
      `UPDATE user_profiles
     SET dob = ?, gender = ?, address = ?, city = ?, state = ?, country = ?, pincode = ?, profile_completion = ?,
         profile_title = ?, about_me = ?, current_location = ?, preferred_location = ?,
         total_experience_years = ?, total_experience_months = ?, notice_period = ?, expected_salary = ?,
         resume_url = ?, updated_at = NOW()
     WHERE user_id = ?`,
      [
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
        userId,
      ],
    );
    return res.affectedRows;
  }

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
        education.grade || null,
      ],
    );
    return true;
  }

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

  async addSkill(userId, skill) {
    await getWritePool().execute(`INSERT INTO user_skills (user_id, skill_name, proficiency_level) VALUES (?, ?, ?)`, [
      userId,
      skill.skill_name,
      skill.proficiency_level || null,
    ]);
    return true;
  }

  // List helpers (with pagination)
  async listEducations(userId) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_education WHERE user_id = ? ORDER BY end_year DESC`, [userId]);
    return rows;
  }

  async listExperiences(userId) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_experience WHERE user_id = ? ORDER BY start_date DESC`, [userId]);
    return rows;
  }

  async listSkills(userId) {
    const [rows] = await getReadPool().execute(`SELECT * FROM user_skills WHERE user_id = ?`, [userId]);
    return rows;
  }
}

export default new UserQueries();
