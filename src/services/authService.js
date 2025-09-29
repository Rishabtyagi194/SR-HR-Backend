// src/services/authService.js
import employerRepository from '../queries/employerQueries.js';
import { generateToken } from '../config/jwt.js';

class AuthService {
  async authenticateEmployer(username, password, ip, userAgent) {
    const employer = await employerRepository.findByEmailOrPhone(username);
    if (!employer) {
      throw new Error('Invalid username or password');
    }

    if (!employer.is_active) {
      throw new Error('Account is inactive. Please contact support.');
    }

    const isMatch = await employerRepository.comparePassword(password, employer.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    await employerRepository.updateLoginInfo(employer.id, ip, userAgent);

    const token = generateToken({
      id: employer.id,
      role: employer.role,
      permissions: employer.permissions,
    });

    return { employer, token };
  }
}

export default new AuthService();
