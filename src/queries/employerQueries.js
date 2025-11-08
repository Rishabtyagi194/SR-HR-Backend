// src/queries/employerQueries.js
import { getReadPool, getWritePool } from '../config/database.js';
import EmployerUser from '../models/EmployersAndUsers.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

class EmployerQueries {
  // Create employer user
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // expires in 15 mins

    const values = [
      userData.company_id ?? null,
      userData.employer_id ?? null,
      userData.name ?? null,
      userData.email ?? null,
      hashedPassword,
      userData.phone ?? null,
      userData.role ?? 'employer_admin',
      userData.permissions ? JSON.stringify(userData.permissions) : null,
      0, // is_active = false by default
      otp,
      otpExpiresAt,
    ];

    const [result] = await getWritePool().execute(
      `INSERT INTO employer_users 
    (company_id, employer_id, name, email, password, phone, role, permissions, is_active, email_otp, otp_expires_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values,
    );

    // Send OTP Email
    const emailHtml = `
      <h2>Verify your email</h2>
      <p>Your OTP for verifying your employer account is:</p>
      <h1 style="letter-spacing:3px;">${otp}</h1>
      <p>This OTP will expire in 15 minutes.</p>
    `;

    await sendEmail(userData.email, 'Your RozgarDwar Verification OTP', emailHtml);

    return {
      id: result.insertId,
      company_id: userData.company_id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'employer_admin',
      is_active: false,
    };
  }

  // ------------------------------------------------------------

  // for login
  async findByEmailOrPhone(identifier) {
    const query = isNaN(identifier) ? 'SELECT * FROM employer_users WHERE email = ?' : 'SELECT * FROM employer_users WHERE phone = ?';

    const [rows] = await getReadPool().execute(query, [identifier]);
    return rows.length > 0 ? new EmployerUser(rows[0]) : null;
  }

  // ------------------------------------------------------------

  // get all employers
  async findAllEmployers() {
    const [rows] = await getReadPool().execute('SELECT * FROM employer_users WHERE role = "employer_admin"');
    return rows.map((row) => new EmployerUser(row));
  }

  // ------------------------------------------------------------

  // get all staff created by a specific employer
  async findAllStaffByEmployer(employerId) {
    const [rows] = await getReadPool().execute('SELECT * FROM employer_users WHERE role = "employer_staff" AND employer_id = ?', [
      employerId,
    ]);
    return rows.map((row) => new EmployerUser(row));
  }

  // ------------------------------------------------------------

  // get user by id
  async findById(id, useMaster = false) {
    const pool = useMaster ? getWritePool() : getReadPool();
    const [rows] = await pool.execute('SELECT * FROM employer_users WHERE id = ?', [id]);
    return rows.length > 0 ? new EmployerUser(rows[0]) : null;
  }

  // get staff by id under a specific employer
  async findStaffByIdAndEmployer(userId, employerId) {
    const [rows] = await getReadPool().execute(
      'SELECT * FROM employer_users WHERE id = ? AND employer_id = ? AND role = "employer_staff"',
      [userId, employerId],
    );
    return rows.length > 0 ? new EmployerUser(rows[0]) : null;
  }

  // ------------------------------------------------------------

  // For super admin (can update any user)
  async updateUser(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    if (updateData.phone) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    if (updateData.role) {
      fields.push('role = ?');
      values.push(updateData.role);
    }
    if (updateData.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updateData.is_active ? 1 : 0);
    }
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await getWritePool().execute(`UPDATE employer_users SET ${fields.join(', ')} WHERE id = ?`, values);

    return result.affectedRows > 0;
  }

  // For employer admin (can update only their own staff)
  async updateUserByEmployer(id, employerId, updateData) {
    const fields = [];
    const values = [];

    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    if (updateData.phone) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    if (updateData.role) {
      fields.push('role = ?');
      values.push(updateData.role);
    }
    if (updateData.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updateData.is_active ? 1 : 0);
    }
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) return null;

    values.push(id, employerId);

    const [result] = await getWritePool().execute(
      `UPDATE employer_users 
     SET ${fields.join(', ')} 
     WHERE id = ? AND employer_id = ? AND role = 'employer_staff'`,
      values,
    );

    return result.affectedRows > 0;
  }

  // ------------------------------------------------------------

  // Delete employer/staff
  async deleteUser(id) {
    const [result] = await getWritePool().execute('DELETE FROM employer_users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // async findByEmail(email) {
  //   const [rows] = await pool.execute('SELECT * FROM employer_users WHERE email = ?', [email]);
  //   return rows.length > 0 ? new EmployerUser(rows[0]) : null;
  // }

  async updateLoginInfo(employerId, ip, userAgent) {
    const loginHistory = {
      loginAt: new Date(),
      ip,
      userAgent,
    };

    await getWritePool().execute(
      `UPDATE employer_users 
       SET last_login = CURRENT_TIMESTAMP, 
      login_history = JSON_ARRAY_APPEND(COALESCE(login_history, '[]'), '$', ?)
       WHERE id = ?`,
      [JSON.stringify(loginHistory), Number(employerId)],
    );
  }

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new EmployerQueries();
