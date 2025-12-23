import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getReadPool, getWritePool } from '../config/database.js';
import UserQueries from '../queries/userQueries.js';
import { generateOTP, sendVerificationOTP } from '../helpers/otpHelper.js';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'abfa477a5f71155408d7e69fcc35abc378';

class UserService {
  //  ---------------------------- Signup ---------------------------

  async register({ full_name, email, password, phone }) {
    const existing = await UserQueries.findByEmail(email);
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min validity

    const conn = await getWritePool().getConnection();
    try {
      await conn.beginTransaction();

      // Insert user record
      const [ins] = await conn.execute(
        `INSERT INTO users (full_name, email, password, phone, email_otp, otp_expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [full_name, email, hashed, phone || null, otp, otpExpiresAt],
      );
      const userId = ins.insertId;

      // Initialize empty profile
      await conn.execute(
        `INSERT INTO user_profiles (user_id, created_at, updated_at)
         VALUES (?, NOW(), NOW())`,
        [userId],
      );

      await conn.commit();

      // Send OTP email
      await sendVerificationOTP(email, otp);

      return {
        user_id: userId,
        email,
        message: 'Verififcation OTP sent to email. Please verify your email.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  //  ---------------------------- Login ---------------------------

  //  Login only if verified (is_active = true)
  async login({ email, password }) {
    const user = await UserQueries.findByEmail(email);
    console.log('user', user);
    // console.log('user.is_active', user.is_active);

    if (!user) throw new Error('Invalid credentials');

    if (!user.is_active) throw new Error('Email not verified. Please verify your account before logging in.');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'job_seeker' }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        is_mobile_verified: user.is_mobile_verified,
        is_email_verified: user.is_email_verified,
        role: user.role,
        is_active: user.is_active,
      },
    };
  }

  //  ---------------------------- Profile ---------------------------
  async getProfile(userId) {
    const user = await UserQueries.findById(userId);
    if (!user) throw new Error('User not found');

    const [educations, experiences, skills] = await Promise.all([
      UserQueries.listEducations(userId),
      UserQueries.listExperiences(userId),
      UserQueries.listSkills(userId),
    ]);

    return {
      user,
      profile: {
        educations,
        experiences,
        skills,
      },
    };
  }

  async updateProfile(userId, profile) {
    const [rows] = await getReadPool().execute(`SELECT id FROM user_profiles WHERE user_id = ?`, [userId]);

    if (!rows.length) {
      await UserQueries.createProfile(userId, profile);
    } else {
      await UserQueries.updateProfile(userId, profile);
    }

    const updatedUser = await this.getProfile(userId);
    return updatedUser;
  }

  //  -----------------------Education ---------------------------

  async addEducation(userId, education) {
    return await UserQueries.addEducation(userId, education);
  }

  async updateEducation(userId, eduId, education) {
    return await UserQueries.updateEducation(userId, eduId, education);
  }

  async listEducations(userId) {
    return await UserQueries.listEducations(userId);
  }

  async deleteEducation(eduId) {
    const [res] = await getWritePool().execute(`DELETE FROM user_education WHERE id = ?`, [eduId]);
    return res.affectedRows > 0;
  }

  //  --------------------- Experience ---------------------------
  async addExperience(userId, exp) {
    return await UserQueries.addExperience(userId, exp);
  }

  async updateExperience(userId, expId, exp) {
    return await UserQueries.updateExperience(userId, expId, exp);
  }

  async listExperiences(userId) {
    return await UserQueries.listExperiences(userId);
  }

  async deleteExperience(expId) {
    const [res] = await getWritePool().execute(`DELETE FROM user_experience WHERE id = ?`, [expId]);
    return res.affectedRows > 0;
  }

  //  ---------------------- Skills ---------------------------
  async addSkill(userId, skill) {
    return await UserQueries.addSkill(userId, skill);
  }

  async updateSkill(userId, skillId, skills) {
    return await UserQueries.updateSkill(userId, skillId, skills);
  }

  async listSkills(userId) {
    return await UserQueries.listSkills(userId);
  }

  async deleteSkill(skillId) {
    const [res] = await getWritePool().execute(`DELETE FROM user_skills WHERE id = ?`, [skillId]);
    return res.affectedRows > 0;
  }

  //  ------------------------Resume ---------------------------
  async uploadResume(userId, resumeUrl, publicId) {
    await getWritePool().execute(
      `UPDATE user_profiles 
     SET resume_url = ?, resume_public_id = ?, updated_at = NOW() 
     WHERE user_id = ?`,
      [resumeUrl, publicId, userId],
    );
    return { user_id: userId, resume_url: resumeUrl };
  }
}

export default new UserService();

// *********************************************************************************************
