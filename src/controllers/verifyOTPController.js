import { getReadPool, getWritePool } from '../config/database.js';
import { generateOTP, sendVerificationOTP } from '../helpers/otpHelper.js';

// POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  const { email, otp, role } = req.body;

  if (!email || !otp || !role) return res.status(400).json({ message: 'Email, OTP, and role are required.' });

  // Proper condition
  const table = role === 'employer_admin' || role === 'employer_staff' ? 'employer_users' : 'users';

  try {
    const [rows] = await getReadPool().execute(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid email.' });

    const user = rows[0];

    if (user.is_active) return res.status(400).json({ message: 'Account already verified.' });

    if (user.email_otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });

    if (new Date() > new Date(user.otp_expires_at)) return res.status(400).json({ message: 'OTP expired.' });

    await getWritePool().execute(`UPDATE ${table} SET is_email_verified = 1, is_active = 1, email_otp = NULL, otp_expires_at = NULL WHERE id = ?`, [user.id]);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/auth/resend-otp
export const resendOTP = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) return res.status(400).json({ message: 'Email and role are required.' });

  const table = role === 'employer_admin' || role === 'employer_staff' ? 'employer_users' : 'users';

  try {
    const [rows] = await getReadPool().execute(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (!rows.length) return res.status(400).json({ message: 'Account not found.' });

    const user = rows[0];

    if (user.is_active) return res.status(400).json({ message: 'Account already verified.' });

    // Prevent spam (60s cooldown)
    if (user.otp_expires_at) {
      const lastOtpTime = new Date(user.otp_expires_at).getTime() - 15 * 60 * 1000;
      if (Date.now() - lastOtpTime < 60 * 1000)
        return res.status(429).json({
          message: 'Please wait 60 seconds before requesting another OTP.',
        });
    }

    const newOtp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await getWritePool().execute(`UPDATE ${table} SET email_otp = ?, otp_expires_at = ? WHERE email = ?`, [newOtp, otpExpiresAt, email]);

    await sendVerificationOTP(email, newOtp);

    res.status(200).json({ success: true, message: 'New OTP sent successfully.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
