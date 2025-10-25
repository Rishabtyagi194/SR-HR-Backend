// src/services/userService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getReadPool, getWritePool } from '../config/database.js'; // for transactions
import UserQueries from '../queries/userQueries.js';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'abfa477a5f71155408d7e69fcc35abc378';

class UserService {
  async register({ full_name, email, password, phone }) {
    // check email exists
    const existing = await UserQueries.findByEmail(email);
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // create user and an empty profile inside a transaction
    const conn = await getWritePool().getConnection();
    try {
      await conn.beginTransaction();
      const [ins] = await conn.execute(`INSERT INTO users (full_name, email, password, phone, created_at) VALUES (?, ?, ?, ?, NOW())`, [
        full_name,
        email,
        hashed,
        phone || null,
      ]);
      const userId = ins.insertId;

      await conn.execute(`INSERT INTO user_profiles (user_id,  created_at, updated_at) VALUES (?,  NOW(), NOW())`, [userId]);

      await conn.commit();
      return { user_id: userId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async login({ email, password }) {
    const user = await UserQueries.findByEmail(email);
    // console.log('user', user);

    if (!user) throw new Error('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    // console.log('Password from DB:', user.password);
    // console.log('password', password);

    if (!ok) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return { token, user };
  }

  async getProfile(userId) {
    const user = await UserQueries.findById(userId);
    if (!user) throw new Error('User not found');

    const [educations, experiences, skills] = await Promise.all([
      UserQueries.listEducations(userId),
      UserQueries.listExperiences(userId),
      UserQueries.listSkills(userId),
    ]);

    // return aggregated object
    return {
      user,
      profile: {
        educations: educations || [],
        experiences: experiences || [],
        skills: skills || [],
      },
    };
  }

  async updateProfile(userId, profile) {
    // Check if profile exists
    const [rows] = await getReadPool().execute(`SELECT id FROM user_profiles WHERE user_id = ?`, [userId]);

    if (!rows.length) {
      // No profile exists, create one
      await UserQueries.createProfile(userId, profile);
    } else {
      // Profile exists, update it
      await UserQueries.updateProfile(userId, profile);
    }

    // Return the updated profile
    const updatedUser = await this.getProfile(userId);
    return updatedUser;
  }

  async addEducation(userId, education) {
    return await UserQueries.addEducation(userId, education);
  }

  async addExperience(userId, exp) {
    return await UserQueries.addExperience(userId, exp);
  }

  async addSkill(userId, skill) {
    return await UserQueries.addSkill(userId, skill);
  }
}

export default new UserService();
