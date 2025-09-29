// src/repositories/companyRepository.js
import db from '../config/database.js';
import Company from '../models/Companies.model.js';

const pool = db.getPool();

class CompanyQueries {
  async create(companyData) {
    const [result] = await pool.execute(
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

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM companies WHERE id = ?', [id]);
    return rows.length > 0 ? new Company(rows[0]) : null;
  }

  async updateAdminUserId(companyId, adminUserId) {
    await pool.execute('UPDATE companies SET admin_user_id = ? WHERE id = ?', [adminUserId, companyId]);
  }

  async findAll(query = {}, options = {}) {
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

    const limit = parseInt(options.limit, 10);
    const offset = parseInt(options.offset, 10);

    if (isNaN(limit) || isNaN(offset)) {
      throw new Error(`Invalid pagination values: limit=${options.limit}, offset=${options.offset}`);
    }

    // whitelist columns for ORDER BY
    const allowedSort = ['created_at', 'name', 'status'];
    const sortBy = allowedSort.includes(options.sortBy) ? options.sortBy : 'created_at';

    const order = options.order === 'asc' ? 'ASC' : 'DESC';

    console.log({ limit, offset, params });

    const [rows] = await pool.execute(
      `SELECT c.*, eu.name as admin_name, eu.email as admin_email, eu.phone as admin_phone, eu.role as admin_role, eu.is_active as admin_active
        FROM companies c
        LEFT JOIN employer_users eu ON c.admin_user_id = eu.id
        WHERE 1=1
        ORDER BY ${sortBy} ${order}
        LIMIT ${pool.escape(limit)} OFFSET ${pool.escape(offset)}`,
      params,
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

        // include joined admin details
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
}

export default new CompanyQueries();
