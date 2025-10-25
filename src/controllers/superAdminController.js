// src/controllers/superAdminController.js
import superAdminService from '../services/superAdminService.js';
import { generateToken } from '../config/jwt.js';

export const AdminSignup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // if (password.length < 6) {
    //   return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    // }

    const newAdmin = await superAdminService.createAdmin({
      name,
      email,
      phone,
      password,
      role,
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    if (error.message === 'Email/Phone already exists') {
      return res.status(400).json({ msg: 'Email/Phone already exist' });
    }
    res.status(500).json({ msg: 'Error creating new admin', error: error.message });
  }
};

export const AdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }

    const admin = await superAdminService.authenticateAdmin(username, password);
    const token = generateToken(admin);

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        last_login: admin.last_login,
      },
    });
  } catch (error) {
    const knownErrors = ['User not found with this email', 'User not found with this phone', 'Invalid credentials'];

    const statusCode = knownErrors.includes(error.message) ? 401 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};
