// src/services/superAdminService.js
import superAdminQueries from '../queries/superAdminQueries.js';
import bcrypt from 'bcrypt';

class superAdminService {
  async createAdmin(adminData) {
    const existingAdmin = await superAdminQueries.findByEmailOrPhone(adminData.email);
    if (existingAdmin) {
      throw new Error('Email/Phone already exists');
    }

    // Also check by phone
    const existingByPhone = await superAdminQueries.findByEmailOrPhone(adminData.phone);
    if (existingByPhone) {
      throw new Error('Email/Phone already exists');
    }

    return await superAdminQueries.create(adminData);
  }

  async authenticateAdmin(username, password) {
    const admin = await superAdminQueries.findByEmailOrPhone(username);
    if (!admin) {
      throw new Error('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    await superAdminQueries.updateLastLogin(admin.id);
    return admin;
  }
}

export default new superAdminService();
