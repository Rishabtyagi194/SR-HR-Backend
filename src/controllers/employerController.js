import { generateToken } from '../config/jwt.js';
import employerServices from '../services/employerServices.js';
import staffServices from '../services/staffServices.js';

export const employerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }

    const employer = await employerServices.authenticateEmployer(username, password, req.ip, req.headers['user-agent']);

    const token = generateToken({
      id: employer.id,
      email: employer.email,
      role: employer.role,
      company_id: employer.company_id,
      permissions: employer.permissions,
    });
    res.status(200).json({
      message: 'Login successful',
      token,
      employer: {
        id: employer.id,
        name: employer.name,
        email: employer.email,
        phone: employer.phone,
        role: employer.role,
        company_id: employer.company_id,
        last_login: new Date(),
        login_history: employer.loginHistory,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

//creating employer sub user
export const createEmployerStaff = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const user = req.user;
    console.log('user in createEmployerStaff:', req.user);

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const newStaff = await staffServices.createStaff({
      name,
      email,
      phone,
      password,
      role: role || 'employer_staff',
      company_id: user.company_id, // from token/session
      employer_id: user.id, // the employer creating staff
    });

    res.status(201).json(newStaff);
  } catch (error) {
    if (error.message === 'Email/Phone already exists') {
      return res.status(400).json({ msg: 'Email/Phone already exist' });
    }
    res.status(500).json({ msg: 'Error creating new staff', error: error.message });
  }
};
