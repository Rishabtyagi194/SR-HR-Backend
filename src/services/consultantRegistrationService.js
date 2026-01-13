import bcrypt from 'bcrypt';
import { createAgency, createConsultantUser, findAllConsultant, findConsultantByIdentifier, updateLoginInfo } from '../queries/consultantRegistrationQueries.js';
import { getWritePool } from '../config/database.js';

// ---------------------- register--------------------------------------s
export const registerConsultantAgency = async (payload) => {
  const connection = await getWritePool().getConnection();

  try {
    await connection.beginTransaction();

    // Create agency
    const companyId = await createAgency(connection, payload.agency);

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.user.password, 10);
    // console.log("hashedPassword", hashedPassword);

    // Create consultant admin (owner)
    const userId = await createConsultantUser(connection, {
      ...payload.user,
      password: hashedPassword,
      organisation_id: companyId,
    });

    await connection.commit();

    return {
      companyId,
      userId,
      message: 'Agency registered successfully. Please verify email.',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ---------------------- login--------------------------------------
export const authenticateConsultant = async (username, password, ip, userAgent) => {
  const consultant = await findConsultantByIdentifier(username);
// console.log("consultant", consultant);

  //  No admin found
  if (!consultant) {
    const isEmail = isNaN(username);
    const field = isEmail ? 'email' : 'phone';
    throw new Error(`User not found with this ${field}`);
  }
  // is account active
  if (!consultant.is_active) {
    throw new Error('Your account is not verified. Please contact support.');
  }

//   console.log('INPUT PASSWORD:', password);
// console.log('HASH FROM DB:', consultant.password);

  // Verify password
  const isMatch = await bcrypt.compare(password, consultant.password);
  // console.log("isMatch", isMatch);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Update last login + login history
  await updateLoginInfo(consultant.id, ip, userAgent);

  return consultant; // just return consultant, no token
};

// ---------------------- get all --------------------------------------
export const getAllConsultant = async () =>{
  const consultant = await findAllConsultant();

  return consultant;
}