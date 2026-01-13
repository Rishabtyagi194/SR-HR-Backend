import { getReadPool, getWritePool } from '../config/database.js';
import { generateOTP, sendVerificationOTP } from '../helpers/otpHelper.js';
import ConsultantUser from '../models/consultantUser.model.js';

export const createAgency = async (connection, data) => {
  const [result] = await connection.execute(
    `INSERT INTO consultant_agencies
     (name, industry, contact_email, contact_phone, address)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.name,
      data.industry,
      data.contact_email,
      data.contact_phone,
      data.address,
    ]
  );

  return result.insertId;
};

export const createConsultantUser = async (connection, data) => {
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const [result] = await connection.execute(
    `INSERT INTO consultant_users
     (organisation_id, name, email, password, phone, role, is_owner, is_active, email_otp, otp_expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.organisation_id,
      data.name,
      data.email,
      data.password,
      data.phone,
      data.role || 'consultant_admin',
      true,
      false,
      otp,
      otpExpiresAt,
    ]
  );

  await sendVerificationOTP(data.email, otp);

  return result.insertId;
};

// login 
export const findConsultantByIdentifier = async (identifier) =>{
  const query = isNaN(identifier) ? 'SELECT * FROM consultant_users WHERE email = ?' : 'SELECT * FROM consultant_users WHERE phone = ?';

  const [row] = await getReadPool().execute(query, [identifier]);
  return row.length > 0 ? new ConsultantUser(row[0]) : null;
}

export const updateLoginInfo = async (consultantId) => {
    await getWritePool().execute(
      `UPDATE consultant_users 
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [Number(consultantId)],
    );
}

export const findAllConsultant = async () => {
  const [rows] = await getReadPool().execute(`
    SELECT
      cu.id,
      cu.name,
      cu.email,
      cu.phone,
      cu.role,
      cu.is_owner,
      cu.is_active,
      cu.last_login,
      cu.created_at,
      ca.id AS organisation_id,
      ca.name AS agency_name,
      ca.verified AS agency_verified,
      ca.status AS agency_status
    FROM consultant_users cu
    JOIN consultant_agencies ca ON ca.id = cu.organisation_id
    ORDER BY cu.created_at DESC
  `);

  return rows;
};
