// src/services/employerService.js
import EmployerQueries from '../queries/employerQueries.js';
import bcrypt from 'bcrypt';

class EmployerService {
  async authenticateEmployer(username, password, ip, userAgent) {
    const employer = await EmployerQueries.findByEmailOrPhone(username);
    if (!employer) {
      throw new Error('Invalid username or password');
    }

    // is account active
    if (!employer.isActive) {
      throw new Error('Account is inactive. Please contact support.');
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
}

export default new EmployerService();
