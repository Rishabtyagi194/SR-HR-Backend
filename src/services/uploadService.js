import fs from 'fs';
import xlsx from 'xlsx';
import uploadQueries from '../queries/uploadQueries.js';

class UploadService {
  async processExcelFile(filePath, user) {
    // Read Excel file into JSON
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Cleanup temp file
    fs.unlinkSync(filePath);

    if (!rows || rows.length === 0) {
      throw new Error('Excel file is empty or invalid.');
    }

    // Normalize data dynamically
    const formattedData = rows.map((row) => ({
      company_id: user.company_id,
      uploaded_by: user.id,
      uploaded_by_role: user.role,
      data_json: JSON.stringify(row), // store dynamic fields as JSON
    }));

    // Bulk insert using transaction for speed
    const insertedCount = await uploadQueries.bulkInsert(formattedData);

    return {
      totalRecords: rows.length,
      insertedRecords: insertedCount,
      uploadedBy: user.role,
    };
  }

  async listUploadedData(user) {
    if (user.role === 'employer_admin') {
      return await uploadQueries.findByCompany(user.company_id);
    } else {
      return await uploadQueries.findByUploader(user.id);
    }
  }
}

export default new UploadService();
