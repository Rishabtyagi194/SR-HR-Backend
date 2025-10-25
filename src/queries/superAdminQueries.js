// src/queries/superAdminQueries.js
import { getReadPool, getWritePool } from '../config/database.js';
import Admin from '../models/superAdmin.model.js';
import bcrypt from 'bcrypt';

class superAdminQueries {
  async create(adminData) {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const [result] = await getWritePool().execute('INSERT INTO admins (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', [
      adminData.name,
      adminData.email,
      adminData.phone,
      hashedPassword,
      adminData.role || 'super_admin',
    ]);

    return this.findById(result.insertId, true);
  }

  // async findById(id) {
  //   const [rows] = await getReadPool.execute('SELECT * FROM admins WHERE id = ?', [id]);
  //   return rows.length > 0 ? new Admin(rows[0]) : null;
  // }

  async findById(id, useMaster = false) {
    const pool = useMaster ? getWritePool() : getReadPool();
    const [rows] = await pool.execute('SELECT * FROM admins WHERE id = ?', [id]);
    return rows.length > 0 ? new Admin(rows[0]) : null;
  }

  async findByEmailOrPhone(identifier) {
    const query = isNaN(identifier) ? 'SELECT * FROM admins WHERE email = ?' : 'SELECT * FROM admins WHERE phone = ?';

    const [rows] = await getReadPool().execute(query, [identifier]);
    return rows.length > 0 ? new Admin(rows[0]) : null;
  }

  async updateLastLogin(adminId) {
    await getWritePool().execute('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [adminId]);
  }
}

export default new superAdminQueries();
