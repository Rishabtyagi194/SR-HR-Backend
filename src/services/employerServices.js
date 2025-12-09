// src/services/employerService.js
import EmployerQueries from '../queries/employerQueries.js';
import bcrypt from 'bcrypt';

class EmployerService {
  async authenticateEmployer(username, password, ip, userAgent) {
    const employer = await EmployerQueries.findByEmailOrPhone(username);
    // if (!employer) {
    //   throw new Error('Invalid username or password');
    // }

    //  No admin found
    if (!employer) {
      const isEmail = isNaN(username);
      const field = isEmail ? 'email' : 'phone';
      throw new Error(`User not found with this ${field}`);
    }
    // is account active
    if (!employer.isActive) {
      throw new Error('Your account is not verified. Please contact support.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Update last login + login history
    await EmployerQueries.updateLoginInfo(employer.id, ip, userAgent);

    return employer; // just return employer, no token
  }

  // ------------------------------------------------------------

  async getAllEmployers() {
    const employers = await EmployerQueries.findAllEmployers();
    if (!employers || employers.length === 0) {
      throw new Error('No employers found.');
    }
    return employers;
  }

  // ------------------------------------------------------------

  async getAllEmployerStaff(employerId) {
    const staffs = await EmployerQueries.findAllStaffByEmployer(employerId);
    if (!staffs || staffs.length === 0) {
      throw new Error('No staff found for this employer.');
    }
    return staffs;
  }

  // ------------------------------------------------------------

  async getUserById(id, currentUser) {
    let user;

    // Super admin can fetch any user
    if (currentUser.role === 'super_admin') {
      user = await EmployerQueries.findById(id);
    }
    // Employer admin can only fetch their own staff
    else if (currentUser.role === 'employer_admin') {
      user = await EmployerQueries.findStaffByIdAndEmployer(id, currentUser.id);
    } else {
      throw new Error('Unauthorized to view user details');
    }

    if (!user) {
      throw new Error('User not found or access denied');
    }

    return user;
  }

  // ------------------------------------------------------------

  async updateUser(id, data, currentUser) {
    let success = false;

    if (currentUser.role === 'super_admin') {
      success = await EmployerQueries.updateUser(id, data);
    } else if (currentUser.role === 'employer_admin') {
      success = await EmployerQueries.updateUserByEmployer(id, currentUser.id, data);
    } else {
      throw new Error('Unauthorized to update user');
    }

    if (!success) {
      throw new Error('Update failed or not authorized to modify this user');
    }

    // Return updated record with access restrictions
    return this.getUserById(id, currentUser);
  }

  // ------------------------------------------------------------

  async deleteUser(id) {
    const success = await EmployerQueries.deleteUser(id);
    if (!success) {
      throw new Error('Delete failed, user not found');
    }
    return true;
  }
}

export default new EmployerService();
