// src/queries/userQueries.js
import { getReadPool, getWritePool } from '../config/database.js';
import User from '../models/User.model.js';
import { saveSearchKeyword } from '../services/searchKeywordService.js';

class UserQueries {
  async findByEmail(email) {
    const [rows] = await getReadPool().execute(
      `SELECT id, full_name, email, password, phone, is_mobile_verified, is_email_verified, role, is_active, created_at, updated_at 
     FROM users 
     WHERE email = ? 
     LIMIT 1`,
      [email],
    );
    return rows.length ? new User(rows[0]) : null;
  }

  async findById(userId) {
    const [rows] = await getReadPool().execute(
      `SELECT 
       u.id, u.full_name, u.email, u.password, u.phone, u.profile_image_url, u.profile_image_public_id, u.work_status, u.total_experience_years, u.total_experience_months, u.current_salary_currency, u.current_salary, u.salary_breakdown,
       u.current_location_country, u.current_location, u.availability_to_join, u.Expected_last_working_day, u.is_active, u.is_mobile_verified, u.is_email_verified, u.created_at, u.updated_at,
       up.gender, up.marital_status , up.dob, up.category, up.work_permit_for_usa, up.Work_permit_for_other_countries, up.permanent_address, up.hometown, up.pincode, up.profile_title, up.resume_headline, up.profile_summary,  
       up.profile_completion, up.disability_status, up.key_skills, up.preferred_location, up.willingToRelocate,
       up.notice_period, up.expected_salary, up.resume_url, up.resume_public_id
     FROM users u
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = ? LIMIT 1`,
      [userId],
    );

    return rows.length ? new User(rows[0]) : null;
  }
}

export default new UserQueries();
