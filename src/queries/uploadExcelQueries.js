import { getReadPool, getWritePool } from '../config/database.js';

class UploadQueries {
  // Bulk insert
  async bulkInsert(records) {
    if (!records || records.length === 0) return 0;

    const connection = await getWritePool().getConnection();
    try {
      await connection.beginTransaction();

      const values = records.map((r) => [r.company_id, r.uploaded_by, r.uploaded_by_role, r.data_json]);

      await connection.query(
        `
        INSERT INTO Excel_data_uploads 
        (company_id, uploaded_by, uploaded_by_role, data_json)
        VALUES ?
        `,
        [values],
      );

      await connection.commit();
      return records.length;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Find duplicates by email or phone
  async findDuplicatesByEmailOrPhone(companyId, emails, phones) {
    // If both empty return nothing
    if (emails.length === 0 && phones.length === 0) return [];

    let sql = `
      SELECT id, data_json
      FROM Excel_data_uploads
      WHERE company_id = ?
        AND (
    `;

    const values = [companyId];
    const conditions = [];

    // Email placeholders
    if (emails.length > 0) {
      const emailPlaceholders = emails.map(() => '?').join(',');
      conditions.push(`JSON_UNQUOTE(JSON_EXTRACT(data_json, '$.email')) IN (${emailPlaceholders})`);
      values.push(...emails);
    }

    // Phone placeholders
    if (phones.length > 0) {
      const phonePlaceholders = phones.map(() => '?').join(',');
      conditions.push(`JSON_UNQUOTE(JSON_EXTRACT(data_json, '$.phone')) IN (${phonePlaceholders})`);
      values.push(...phones);
    }

    sql += conditions.join(' OR ') + ')';

    const [rows] = await getReadPool().query(sql, values);
    return rows;
  }

  async findByCompany(companyId) {
    const [rows] = await getWritePool().query(
      `SELECT * FROM Excel_data_uploads 
       WHERE company_id = ? ORDER BY created_at DESC`,
      [companyId],
    );
    return rows;
  }

  async findByUploader(userId) {
    const [rows] = await getWritePool().query(
      `SELECT * FROM Excel_data_uploads 
       WHERE uploaded_by = ? ORDER BY created_at DESC`,
      [userId],
    );
    return rows;
  }

  async getRecordById(id) {
    const [rows] = await getReadPool().query(`SELECT * FROM Excel_data_uploads WHERE id = ?`, [id]);
    return rows[0];
  }

  async updateRecordById(id, data) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No fields to update');
    }

    const jsonSetClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      jsonSetClauses.push(`'$.${key}', ?`);
      values.push(value);
    }

    const jsonSetExpr = jsonSetClauses.join(', ');

    const sql = `
      UPDATE Excel_data_uploads
      SET data_json = JSON_SET(COALESCE(data_json, '{}'), ${jsonSetExpr}),
          updated_at = NOW()
      WHERE id = ?
    `;

    values.push(id);

    await getWritePool().query(sql, values);
  }

  async deleteRecordById(id) {
    await getWritePool().query(`DELETE FROM Excel_data_uploads WHERE id = ?`, [id]);
  }
}

export default new UploadQueries();
