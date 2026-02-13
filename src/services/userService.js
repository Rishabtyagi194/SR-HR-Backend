import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getReadPool, getWritePool } from '../config/database.js';
import UserQueries from '../queries/userQueries.js';
import { generateOTP, sendVerificationOTP } from '../helpers/otpHelper.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'abfa477a5f71155408d7e69fcc35abc378';

class UserService {
  //  ------------------------------------------------------ Signup ----------------------------------------------------------------------------

  async register({
    full_name,
    email,
    password,
    phone,

    role = 'job_seeker',

    work_status,
    current_location_country,
    current_location,

    availability_to_join,
  }) {
    const existing = await UserQueries.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const conn = await getWritePool().getConnection();

    try {
      await conn.beginTransaction();

      // Insert user
      const [result] = await conn.execute(
        `
      INSERT INTO users (
        full_name,
        email,
        password,
        role,
        work_status,
        current_location_country,
        current_location,
        phone,
        availability_to_join,
        email_otp,
        otp_expires_at,
        is_active,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, NOW())
      `,
        [
          full_name,
          email,
          hashedPassword,
          role,
          work_status || null,
          current_location_country || null,
          current_location || null,
          phone || null,
          availability_to_join || null,
          otp,
          otpExpiresAt,
        ],
      );

      const userId = result.insertId;

      // Create empty profile
      await conn.execute(
        `
      INSERT INTO user_profiles (user_id, created_at, updated_at)
      VALUES (?, NOW(), NOW())
      `,
        [userId],
      );

      await conn.commit();

      // Send OTP email AFTER commit
      await sendVerificationOTP(email, otp);

      return {
        user_id: userId,
        email,
        message: 'Verification OTP sent to email. Please verify your email.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  //  ------------------------------------------------------- Login -----------------------------------------------------------------

  //  Login only if verified (is_active = true)
  async login({ email, password }) {
    const user = await UserQueries.findByEmail(email);
    // console.log('user', user);
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

}

export default new UserService();

