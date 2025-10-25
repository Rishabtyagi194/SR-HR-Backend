import { getReadPool, getWritePool } from '../config/database.js';
import employerStaffModel from '../models/EmployersAndUsers.model.js';
import bcrypt from 'bcrypt';

class StaffQueries {
  async create(staffData) {
    const hashedPassword = await bcrypt.hash(staffData.password, 10);

    const values = [
      staffData.company_id ?? null,
      staffData.employer_id ?? null,
      staffData.name,
      staffData.email,
      hashedPassword,
      staffData.phone,
      staffData.role || 'employer_staff',
      staffData.permissions ? JSON.stringify(staffData.permissions) : null,
      staffData.isActive || 1,
    ];

    const [result] = await getWritePool().execute(
      `INSERT INTO employer_users 
       (company_id, employer_id, name, email, password, phone, role, permissions, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values,
    );

    return {
      id: result.insertId,
      company_id: staffData.company_id,
      employer_id: staffData.employer_id,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      role: staffData.role || 'employer_staff',
      permissions: staffData.permissions || null,
      isActive: staffData.isActive || true,
      loginHistory: [],
    };
  }

  async findById(id, useMaster = false) {
    const pool = useMaster ? getWritePool() : getReadPool();
    const [rows] = await pool.execute('SELECT * FROM employer_users WHERE id = ?', [id]);
    return rows.length > 0 ? new employerStaffModel(rows[0]) : null;
  }

  async findByEmailOrPhone(identifier) {
    const query = isNaN(identifier) ? 'SELECT * FROM employer_users WHERE email = ?' : 'SELECT * FROM employer_users WHERE phone = ?';

    const [rows] = await getReadPool().execute(query, [identifier]);
    return rows.length > 0 ? new employerStaffModel(rows[0]) : null;
  }

  async updateLoginInfo(staffId, ip, userAgent) {
    const loginHistory = {
      loginAt: new Date(),
      ip,
      userAgent,
    };
    await getWritePool().execute(
      `UPDATE employer_users SET 
        last_login = CURRENT_TIMEsTAMP,
        login_history = JSON_ARRAY_APPEND(COALESCE(login_history, '[]'), '$', ?)
        WHERE  id = ?`,
      [JSON.stringify(loginHistory), Number(staffId)],
    );
  }

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new StaffQueries();
