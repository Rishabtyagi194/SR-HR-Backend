// src/queries/organisationQueries.js
import { getReadPool, getWritePool } from '../config/database.js';
import Organisations from '../models/Organisations.model.js';

class OrganisationQueries {
  async create(organisationData) {
    const [result] = await getWritePool().execute(
      `INSERT INTO organisations 
      (name, industry, size, website, logo_url, contact_email, contact_phone, address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organisationData.name,
        organisationData.industry || null,
        organisationData.size || null,
        organisationData.website || null,
        organisationData.logo_url || null,
        organisationData.contact_email || null,
        organisationData.contact_phone || null,
        organisationData.address || null,
      ],
    );

    return this.findById(result.insertId, true);
  }

  async findById(id, useMaster = false) {
    const pool = useMaster ? getWritePool() : getReadPool();
    const [rows] = await pool.execute('SELECT * FROM organisations WHERE id = ?', [id]);
    return rows.length > 0 ? new Organisations(rows[0]) : null;
  }

  async updateAdminUserId(organisationId, adminUserId) {
    await getWritePool().execute('UPDATE organisations SET admin_user_id = ? WHERE id = ?', [adminUserId, organisationId]);
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

    const limit = +options.limit || 10;
    const offset = +options.offset || 0;

    const allowedSort = ['created_at', 'name', 'status'];
    const sortBy = allowedSort.includes(options.sortBy) ? options.sortBy : 'created_at';
    const order = options.order === 'asc' ? 'ASC' : 'DESC';

    // console.log('Pagination debug:', { limit, offset, params });

    const [rows] = await pool.query(
      `SELECT c.*, eu.name as admin_name, eu.email as admin_email, eu.phone as admin_phone, eu.role as admin_role, eu.is_active as admin_active
        FROM organisations c
        LEFT JOIN employer_users eu ON c.admin_user_id = eu.id
        ${whereClause}
        ORDER BY ${sortBy} ${order}
        LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    // console.log('SQL Debug:', {
    //   params,
    //   limitType: typeof limit,
    //   limitValue: limit,
    //   offsetType: typeof offset,
    //   offsetValue: offset,
    // });

    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM organisations c ${whereClause}`, params);

    return {
      organisations: rows.map((row) => ({
        id: row.id,
        name: row.name,
        industry: row.industry,
        size: row.size,
        website: row.website,
        contact_email: row.contact_email,
        verified: row.verified,
        status: row.status,
        admin_user_id: row.admin_user_id,
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

  // async findAll(query = {}, options = {}) {
  //   const pool = getReadPool();
  //   let whereClause = 'WHERE 1=1';
  //   const params = [];

  //   if (query.isActive !== undefined) {
  //     whereClause += ' AND status = ?';
  //     params.push(query.isActive === 'true' ? 'active' : 'suspended');
  //   }

  //   if (query.name) {
  //     whereClause += ' AND name LIKE ?';
  //     params.push(`%${query.name}%`);
  //   }

  //   if (query.adminUserId) {
  //     whereClause += ' AND admin_user_id = ?';
  //     params.push(query.adminUserId);
  //   }

  //   const limit = Number.isInteger(Number(options.limit)) ? Number(options.limit) : 10;
  //   const offset = Number.isInteger(Number(options.offset)) ? Number(options.offset) : 0;

  //   const allowedSort = ['created_at', 'name', 'status'];
  //   const sortBy = allowedSort.includes(options.sortBy) ? options.sortBy : 'created_at';
  //   const order = options.order === 'asc' ? 'ASC' : 'DESC';
  //   console.log('Pagination debug:', { limit, offset, params });

  //   const [rows] = await pool.execute(
  //     `SELECT c.*, eu.name as admin_name, eu.email as admin_email, eu.phone as admin_phone, eu.role as admin_role, eu.is_active as admin_active
  //      FROM organisations c
  //      LEFT JOIN employer_users eu ON c.admin_user_id = eu.id
  //      ${whereClause}
  //      ORDER BY ${sortBy} ${order}
  //      LIMIT ? OFFSET ?`,
  //     [...params, limit, offset],
  //   );

  //   console.log('Pagination debug:', { limit, offset, params });

  //   const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM organisations c ${whereClause}`, params);

  //   return {
  //     organisations: rows.map((row) => ({
  //       id: row.id,
  //       name: row.name,
  //       industry: row.industry,
  //       size: row.size,
  //       website: row.website,
  //       contact_email: row.contact_email,
  //       verified: row.verified,
  //       status: row.status,
  //       admin_user_id: row.admin_user_id,
  //       admin: row.admin_user_id
  //         ? {
  //             id: row.admin_user_id,
  //             name: row.admin_name,
  //             email: row.admin_email,
  //             phone: row.admin_phone,
  //             role: row.admin_role,
  //             is_active: row.admin_active,
  //           }
  //         : null,
  //     })),
  //     total: countRows[0].total,
  //   };
  // }

  async deleteorganisationById(id) {
    const [result] = await getWritePool().execute('DELETE FROM organisations WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default new OrganisationQueries();
