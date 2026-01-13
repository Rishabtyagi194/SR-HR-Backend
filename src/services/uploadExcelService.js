import fs from 'fs';
import xlsx from 'xlsx';
import uploadQueries from '../queries/uploadExcelQueries.js';

/* ----------------------------
   Convert all keys + values to lowercase
-----------------------------*/
function toLowercaseRow(row) {
  const newRow = {};
  for (let key in row) {
    const newKey = key.toString().trim().toLowerCase();
    const val = row[key];

    if (val === undefined || val === null) {
      newRow[newKey] = null;
    } else {
      newRow[newKey] = val.toString().trim().toLowerCase();
    }
  }
  return newRow;
}

/* ----------------------------
 Extract and normalize email & phone
-----------------------------*/
function extractEmail(row) {
  return row.email || row.e_mail || row['e-mail'] || row.mail || row.contact_email || null;
}

function extractPhone(row) {
  return row.phone || row.mobile || row['mobile no'] || row.mobile_no || row.contact || row['contact no'] || row.contact_no || null;
}

/* ----------------------------
 Sanitize row before JSON.stringify
-----------------------------*/
function sanitizeRow(row) {
  const clean = {};
  for (let key in row) {
    const val = row[key];

    if (val === undefined) clean[key] = null;
    else if (typeof val === 'object' && val !== null) clean[key] = JSON.stringify(val);
    else clean[key] = val;
  }
  return clean;
}

class UploadService {
  async processExcelFile(filePath, user) {
    // Read Excel
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    fs.unlinkSync(filePath);
    if (!rows || rows.length === 0) {
      throw new Error('Excel file is empty or invalid.');
    }

    /* ----------------------------
       STEP 1 — Normalize everything
       lowercase keys + values
-----------------------------*/
    let normalizedRows = rows.map((r) => toLowercaseRow(r));

    /* ----------------------------
       STEP 2 — Extract email + phone
-----------------------------*/
    normalizedRows = normalizedRows.map((r) => {
      const email = extractEmail(r);
      const phone = extractPhone(r);

      return {
        ...r,
        email: email ? email.toLowerCase() : null,
        phone: phone ? phone.toString() : null,
      };
    });

    /* ----------------------------
       STEP 3 — Internal duplicate detection
-----------------------------*/
    const excelDuplicateSet = new Set();
    const uniqueExcelRows = [];
    const internalDuplicates = [];

    normalizedRows.forEach((r) => {
      const key = `${r.email || ''}_${r.phone || ''}`;

      if (excelDuplicateSet.has(key)) {
        internalDuplicates.push(r);
      } else {
        excelDuplicateSet.add(key);
        uniqueExcelRows.push(r);
      }
    });

    /* ----------------------------
       STEP 4 — DB duplicate check
    -----------------------------*/
    const emails = uniqueExcelRows.filter((r) => r.email).map((r) => r.email);
    const phones = uniqueExcelRows.filter((r) => r.phone).map((r) => r.phone);

    const existingDuplicates = await uploadQueries.findDuplicatesByEmailOrPhone(user.organisation_id, emails, phones);

    const dbDuplicateSet = new Set();

    existingDuplicates.forEach((rec) => {
      let data = rec.data_json; // Already parsed JSON

      // But ensure it's an object
      if (typeof data !== 'object' || data === null) {
        console.log('Invalid JSON in DB, skipping:', rec.data_json);
        return;
      }

      if (data.email) dbDuplicateSet.add(data.email.toLowerCase());
      if (data.phone) dbDuplicateSet.add(data.phone);
    });

    const dbDuplicates = [];
    const finalUniqueRows = [];

    uniqueExcelRows.forEach((r) => {
      if ((r.email && dbDuplicateSet.has(r.email)) || (r.phone && dbDuplicateSet.has(r.phone))) {
        dbDuplicates.push(r);
      } else {
        finalUniqueRows.push(r);
      }
    });

    /* ----------------------------
       STEP 5 — Insert unique rows
    -----------------------------*/
    const formattedData = finalUniqueRows.map((row) => ({
      organisation_id: user.organisation_id,
      uploaded_by: user.id,
      uploaded_by_role: user.role,
      data_json: JSON.stringify(sanitizeRow(row)), // SAFE JSON
    }));

    let insertedCount = 0;
    if (formattedData.length > 0) {
      insertedCount = await uploadQueries.bulkInsert(formattedData);
    }

    /* ----------------------------
       FINAL RESPONSE
-----------------------------*/
    return {
      totalRows: rows.length,

      internalDuplicateRows: internalDuplicates.length,
      internalDuplicateData: internalDuplicates,

      dbDuplicateRows: dbDuplicates.length,
      dbDuplicateData: dbDuplicates,

      insertedRows: insertedCount,
    };
  }

  /* ----------------------------
      OTHER METHODS
-----------------------------*/
  async listUploadedData(user) {
    if (user.role === 'employer_admin') {
      return await uploadQueries.findByCompany(user.organisation_id);
    }
    return await uploadQueries.findByUploader(user.id);
  }

  async updateRecordById(user, id, data) {
    const existing = await uploadQueries.getRecordById(id);
    if (!existing) throw new Error('Record not found');
    if (existing.organisation_id !== user.organisation_id) throw new Error('Unauthorized access');

    await uploadQueries.updateRecordById(id, data);
    return { id, updated: true };
  }

  async deleteRecordById(user, id) {
    const existing = await uploadQueries.getRecordById(id);
    if (!existing) throw new Error('Record not found');
    if (existing.organisation_id !== user.organisation_id) throw new Error('Unauthorized access');

    await uploadQueries.deleteRecordById(id);
    return { id, deleted: true };
  }
}

export default new UploadService();
