// src/services/userService.js
import userRepository from '../queries/userQueries.js';
import { hashPassword, comparePassword } from '../utils/helpers.js';

class UserService {
  async createUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(userData.password);
    return userRepository.create({ ...userData, password: hashedPassword });
  }

  async authenticateUser(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await comparePassword(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return user;
  }
}

export default new UserService();
