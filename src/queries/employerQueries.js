// src/queries/employerQueries.js
import db from '../config/database.js';
import EmployerUser from '../models/EmployersAndUsers.model.js';
import bcrypt from 'bcrypt';

const pool = db.getPool();

class EmployerQueries {
  // Create employer user
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const values = [
      userData.company_id ?? null,
      userData.employer_id ?? null,
      userData.name ?? null,
      userData.email ?? null,
      hashedPassword,
      userData.phone ?? null,
      userData.role ?? 'employer_admin',
      userData.permissions ? JSON.stringify(userData.permissions) : null,
      userData.is_active ? 1 : 0,
    ];

    const [result] = await pool.execute(
      `INSERT INTO employer_users 
   (company_id, employer_id, name, email, password, phone, role, permissions, is_active) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values,
    );

    // Return numeric ID with minimal info to avoid string conversion issues
    return {
      id: result.insertId,
      company_id: userData.company_id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'employer_admin',
      is_active: userData.is_active ? true : false,
    };
  }

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM employer_users WHERE id = ?', [id]);
    return rows.length > 0 ? new EmployerUser(rows[0]) : null;
  }

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM employer_users WHERE email = ?', [email]);
    return rows.length > 0 ? new EmployerUser(rows[0]) : null;
  }

  async findByEmailOrPhone(identifier) {
    const query = isNaN(identifier) ? 'SELECT * FROM employer_users WHERE email = ?' : 'SELECT * FROM employer_users WHERE phone = ?';

    const [rows] = await pool.execute(query, [identifier]);
    return rows.length > 0 ? new EmployerUser(rows[0]) : null;
  }

  async updateLoginInfo(employerId, ip, userAgent) {
    const loginHistory = {
      loginAt: new Date(),
      ip,
      userAgent,
    };

    await pool.execute(
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
