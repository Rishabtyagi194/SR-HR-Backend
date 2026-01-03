import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateOTP } from '../helpers/otpHelper.js';
import { getWritePool } from '../config/database';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'abfa477a5f71155408d7e69fcc35abc378';


class consultantService {
    async register({ name, email, password, phone }){
        const existing = await consultantQueries.findByEmail(email);
        if (existing) throw new Error('Email already registered');

        const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

        const conn = await getWritePool().getConnection();

        try {
            
            await conn.beginTransaction();

            // Insert record
            const [insert] = await conn.execute(
                `INSERT INTO consultant_users (name, email, password, phone, email_otp, otp_expires_at, created_at)
                 VALUES ( ?, ?, ?,  ?, ?, ?, NOW())`,
                 [name, email, hashedPass, phone || null, otp, otpExpiresAt]
            );

            const userId = insert.insertId;


        } catch (error) {
            
        }
    }

}
export default new consultantService();
