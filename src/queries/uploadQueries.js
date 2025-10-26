import { getWritePool } from '../config/database.js';

class UploadQueries {
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

  async findByCompany(companyId) {
    const [rows] = await getWritePool().query(`SELECT * FROM employee_data_uploads WHERE company_id = ? ORDER BY created_at DESC`, [
      companyId,
    ]);
    return rows;
  }

  async findByUploader(userId) {
    const [rows] = await getWritePool().query(`SELECT * FROM employee_data_uploads WHERE uploaded_by = ? ORDER BY created_at DESC`, [
      userId,
    ]);
    return rows;
  }
}

export default new UploadQueries();
