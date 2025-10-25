// src/queries/companyQueries.js
import { getReadPool, getWritePool } from '../config/database.js';
import Company from '../models/Companies.model.js';

class CompanyQueries {
  async create(companyData) {
    const [result] = await getWritePool().execute(
      `INSERT INTO companies 
      (name, industry, size, website, logo_url, contact_email, contact_phone, address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyData.name,
        companyData.industry || null,
        companyData.size || null,
        companyData.website || null,
        companyData.logo_url || null,
        companyData.contact_email || null,
        companyData.contact_phone || null,
        companyData.address || null,
      ],
    );

    return this.findById(result.insertId, true);
  }

  async findById(id, useMaster = false) {
    const pool = useMaster ? getWritePool() : getReadPool();
    const [rows] = await pool.execute('SELECT * FROM companies WHERE id = ?', [id]);
    return rows.length > 0 ? new Company(rows[0]) : null;
  }

  async updateAdminUserId(companyId, adminUserId) {
    await getWritePool().execute('UPDATE companies SET admin_user_id = ? WHERE id = ?', [adminUserId, companyId]);
  }

  async findAll(query = {}, options = {}) {
    const pool = getReadPool();
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (query.isActive !== undefined) {
      whereClause += ' AND status = ?';
      params.push(query.isActive === 'true' ? 'active' : 'suspended');
    }

    if (query.name) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${query.name}%`);
    }

    if (query.adminUserId) {
      whereClause += ' AND admin_user_id = ?';
      params.push(query.adminUserId);
    }

    const limit = parseInt(options.limit, 10) || 10;
    const offset = parseInt(options.offset, 10) || 0;

    const allowedSort = ['created_at', 'name', 'status'];
    const sortBy = allowedSort.includes(options.sortBy) ? options.sortBy : 'created_at';
    const order = options.order === 'asc' ? 'ASC' : 'DESC';

    const [rows] = await pool.execute(
      `SELECT c.*, eu.name as admin_name, eu.email as admin_email, eu.phone as admin_phone, eu.role as admin_role, eu.is_active as admin_active
       FROM companies c
       LEFT JOIN employer_users eu ON c.admin_user_id = eu.id
       ${whereClause}
       ORDER BY ${sortBy} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM companies c ${whereClause}`, params);

    return {
      companies: rows.map((row) => ({
        id: row.id,
        name: row.name,
        industry: row.industry,
        size: row.size,
        website: row.website,
        contact_email: row.contact_email,
        verified: row.verified,
        status: row.status,
        admin_user_id: row.admin_user_id,
<<<<<<< HEAD
=======

        // admin details
>>>>>>> 25f851ac7d721537ea311ef8d52d1e578de77e08
        admin: row.admin_user_id
          ? {
              id: row.admin_user_id,
              name: row.admin_name,
              email: row.admin_email,
              phone: row.admin_phone,
              role: row.admin_role,
              is_active: row.admin_active,
            }
          : null,
      })),
      total: countRows[0].total,
    };
  }

  async deleteCompanyById(id) {
<<<<<<< HEAD
    const [result] = await getWritePool().execute('DELETE FROM companies WHERE id = ?', [id]);
=======
    const [result] = await pool.execute('DELETE FROM companies WHERE id = ?', [id]);
>>>>>>> 25f851ac7d721537ea311ef8d52d1e578de77e08
    return result.affectedRows > 0;
  }
}

export default new CompanyQueries();
