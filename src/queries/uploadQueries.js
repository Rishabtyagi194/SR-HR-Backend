import { getReadPool, getWritePool } from '../config/database.js';

class UploadQueries {
  // upload by .xlsx .csv
  async bulkInsert(records) {
    if (!records || records.length === 0) return 0;

    const connection = await getWritePool().getConnection();
    try {
      await connection.beginTransaction();

      const values = records.map((r) => [r.company_id, r.uploaded_by, r.uploaded_by_role, r.data_json]);
      await connection.query(
        `
        INSERT INTO employee_data_uploads 
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

  //   get by company id
  async findByCompany(companyId) {
    const [rows] = await getWritePool().query(`SELECT * FROM employee_data_uploads WHERE company_id = ? ORDER BY created_at DESC`, [
      companyId,
    ]);
    return rows;
  }

  // get by uploader
  async findByUploader(userId) {
    const [rows] = await getWritePool().query(`SELECT * FROM employee_data_uploads WHERE uploaded_by = ? ORDER BY created_at DESC`, [
      userId,
    ]);
    return rows;
  }

  //get by id
  async getRecordById(id) {
    const [rows] = await getReadPool().query(`SELECT * FROM employee_data_uploads WHERE id = ?`, [id]);
    return rows[0];
  }

  // update
  async updateRecordById(id, data) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No fields to update');
    }

    // Convert JSON updates into a SQL JSON_SET() expression
    const jsonSetClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      jsonSetClauses.push(`'$.${key}', ?`);
      values.push(value);
    }

    const jsonSetExpr = jsonSetClauses.join(', ');

    const sql = `
    UPDATE employee_data_uploads
    SET data_json = JSON_SET(COALESCE(data_json, '{}'), ${jsonSetExpr}),
        updated_at = NOW()
    WHERE id = ?
  `;

    values.push(id);

    await getWritePool().query(sql, values);
  }

  // delete
  async deleteRecordById(id) {
    await getWritePool().query(`DELETE FROM employee_data_uploads WHERE id = ?`, [id]);
  }
}

export default new UploadQueries();
