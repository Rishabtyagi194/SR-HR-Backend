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
      organisation_id: employer.organisation_id,
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
        organisation_id: employer.organisation_id,
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
      organisation_id: user.organisation_id, // from token
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

export const listAllEmployers = async (req, res) => {
  try {
    const allEmployers = await employerServices.getAllEmployers();

    res.status(200).json({
      message: 'Employers fetched successfully',
      totalEmployers: allEmployers.length,
      employers: allEmployers.map((emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        organisation_id: emp.organisation_id,
        role: emp.role,
        isActive: emp.isActive,
        login_history: emp.loginHistory,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching employers',
      error: error.message,
    });
  }
};

export const listAllStaffs = async (req, res) => {
  try {
    const employerId = req.user.id; // extracted from JWT by Authenticate middleware
    const allStaffs = await employerServices.getAllEmployerStaff(employerId);

    res.status(200).json({
      message: 'Staff fetched successfully',
      totalStaff: allStaffs.length,
      staffs: allStaffs.map((staff) => ({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        organisation_id: staff.organisation_id,
        employer_id: staff.employer_id,
        role: staff.role,
        isActive: staff.isActive,
        login_history: staff.loginHistory,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching staff',
      error: error.message,
    });
  }
};

// Get employer/staff by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await employerServices.getUserById(id, req.user);

    res.status(200).json({
      message: 'User fetched successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organisation_id: user.organisation_id,
        employer_id: user.employer_id,
        role: user.role,
        isActive: user.isActive,
        login_history: user.loginHistory,
      },
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update employer/staff
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await employerServices.updateUser(id, req.body, req.user);

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        organisation_id: updatedUser.organisation_id,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete employer/staff
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await employerServices.deleteUser(id);

    res.status(200).json({
      message: 'User deleted successfully',
      userId: id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
