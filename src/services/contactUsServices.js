// services/contactUsServices.js
import { getReadPool, getWritePool } from '../config/database.js';
import { sendEmail } from '../utils/sendEmail.js';

class ContactUsServices {
  async create(data) {
    const { name, email, mobileNo, areaOfConcern, message } = data;

    // Insert into DB
    const [result] = await getWritePool().execute(
      `
      INSERT INTO contactusLeads
      (name, email, mobile_no, area_of_concern, message)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, email, mobileNo || null, areaOfConcern || null, message]
    );

    // Email to Admin
    const adminHtml = `
      <h2>New Contact Us Lead</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobileNo || 'N/A'}</p>
      <p><strong>Area of Concern:</strong> ${areaOfConcern || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      'New Contact Us Lead',
      adminHtml
    );

    //  Confirmation email to user
    const userHtml = `
      <p>Hi ${name},</p>
      <p>Thank you for contacting <strong>RozgarDwar</strong>.</p>
      <p>We’ve received your message and will reach out shortly.</p>
      <br/>
      <p>Regards,<br/>RozgarDwar Team</p>
    `;

    await sendEmail(
      email,
      'We received your message',
      userHtml
    );

    return {
      id: result.insertId,
      name,
      email,
      mobileNo,
      areaOfConcern,
      message,
    };
  }

  
   async getAll({ limit, offset }) {
    //  Fetch paginated data
    const [data] = await getReadPool().execute(
      `
      SELECT 
        id,
        name,
        email,
        mobile_no,
        area_of_concern,
        message,
        created_at
      FROM contactusLeads
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      [limit, offset]
    );

    // Fetch total count
    const [[{ total }]] = await getReadPool().execute(
      `
      SELECT COUNT(*) AS total
      FROM contactusLeads
      `
    );

    return {
      data,
      total,
    };
  }
}

export default new ContactUsServices();