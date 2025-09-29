import staffQueries from '../queries/staffQueries.js';
import bcrypt from 'bcrypt';

class StaffService {
  async createStaff(staffData) {
    const existingStaffByEmail = await staffQueries.findByEmailOrPhone(staffData.email);
    if (existingStaffByEmail) {
      throw new Error('Email/Phone already exists');
    }

    const existingStaffByPhone = await staffQueries.findByEmailOrPhone(staffData.phone);
    if (existingStaffByPhone) {
      throw new Error('Email/Phone already exists');
    }
    return await staffQueries.create(staffData);
  }

  async authenticateStaff(username, password, ip, userAgent) {
    const staff = await staffQueries.findByEmailOrPhone(username);
    if (!staff) {
      throw new Error('Invalid username or password');
    }

    // Check if account is active
    if (!staff.isActive) {
      throw new Error('Account is inactive. Please contact support.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Update last login + login history
    await EmployerQueries.updateLoginInfo(staff.id, ip, userAgent);

    return staff;
  }
}
export default new StaffService();
