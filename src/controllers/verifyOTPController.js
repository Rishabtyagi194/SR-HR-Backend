import { getReadPool, getWritePool } from '../config/database.js';

// router.post('/verify-otp',

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP required' });
  }

  try {
    const [rows] = await getReadPool().execute('SELECT * FROM employer_users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const user = rows[0];

    if (user.is_active) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    if (user.email_otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Mark verified
    await getWritePool().execute('UPDATE employer_users SET is_active = ?, email_otp = NULL, otp_expires_at = NULL WHERE id = ?', [
      true,
      user.id,
    ]);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// router.post('/resend-otp',
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const [rows] = await connection.execute('SELECT * FROM employer_users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    const user = rows[0];

    if (user.is_active) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Optional: prevent OTP spam (cooldown: 60 seconds)
    if (user.otp_expires_at) {
      const lastOtpTime = new Date(user.otp_expires_at).getTime() - 15 * 60 * 1000; // OTP created 15 min before expiry
      const now = Date.now();
      if (now - lastOtpTime < 60 * 1000) {
        return res.status(429).json({
          message: 'Please wait at least 60 seconds before requesting another OTP',
        });
      }
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // valid for 15 min

    // Update OTP in DB
    await connection.execute('UPDATE employer_users SET email_otp = ?, otp_expires_at = ? WHERE email = ?', [newOtp, otpExpiresAt, email]);

    // Send OTP Email
    const html = `
      <h2>Your new OTP code</h2>
      <p>Use the OTP below to verify your account:</p>
      <h1 style="letter-spacing:3px;">${newOtp}</h1>
      <p>This OTP will expire in 15 minutes.</p>
    `;

    await sendEmail(email, 'RozgarDwar - New OTP Verification Code', html);

    res.status(200).json({
      message: 'A new OTP has been sent to your email.',
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
