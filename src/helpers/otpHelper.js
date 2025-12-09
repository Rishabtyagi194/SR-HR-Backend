import { sendEmail } from '../utils/sendEmail.js';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationOTP = async (email, otp) => {
  const html = `
    <h2>Verify your email</h2>
    <p>Your OTP for verifying your RozgarDwar account is:</p>
    <h1 style="letter-spacing:3px;">${otp}</h1>
    <p>This OTP will expire in 15 minutes.</p>
  `;
  await sendEmail(email, 'RozgarDwar - Email Verification OTP', html);
};
