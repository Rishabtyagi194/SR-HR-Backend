import mongoose from 'mongoose';
import { generateToken } from '../config/jwt.js';
import employerUserModel from '../models/employerUser.model.js';

export const EmployerLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }

  let query = {};
  if (!isNaN(username)) {
    query = { phone: username };
  } else {
    query = { email: username.trim().toLowerCase() };
  }

  const employer = await employerUserModel.findOne(query);

  if (!employer) {
    return res.status(400).json({ msg: 'Invalid username or password' });
  }

  // if isActive is true then only emplyer can log in
  if (!employer.isActive) {
    return res.status(403).json({ msg: 'Account is inactive. Please contact support.' });
  }

  const isMatch = await employer.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  employer.lastLogin = new Date();
  await employer.save();

  await employerUserModel.updateOne(
    { _id: employer._id },
    {
      $set: { lastLogin: new Date() },
      $push: {
        loginHistory: {
          loginAt: new Date(),
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      },
    },
  );

  const token = generateToken(employer);

  res.status(200).json({
    message: 'Login successful',
    token,
    employer: {
      _id: employer._id,
      name: employer.name,
      email: employer.email,
      phone: employer.phone,
      role: employer.role,
      lastLogin: employer.lastLogin,
      isActive: employer.isActive,
      permissions: employer.permissions,
      loginHistory: employer.loginHistory,
    },
  });
};

// ----------------- get all employer function is in admin controller

// ----------------------- Employer Staff ------------------------------
// create employer staff
export const createEmployerStaff = async (req, res) => {
  try {
    const { name, email, password, phone, permissions, isActive } = req.body;

    const user = req.user; // logged-in employer admin
    console.log(user);

    if (!user || !user.companyId || !user._id) {
      return res.status(400).json({ msg: 'Invalid employer admin context' });
    }

    // Create employer staff
    const employerStaff = await employerUserModel.create({
      companyId: user.companyId, // Company linked to staff
      adminId: user._id, // Employer admin who created the staff
      name,
      email,
      password,
      phone,
      role: 'employer_staff',
      permissions,
      isActive: isActive ?? true, // default true if not provided
    });

    res.status(201).json({
      message: 'Employer staff created successfully',
      employerStaff,
    });
  } catch (error) {
    console.error('createEmployerStaff error:', error);
    return res.status(500).json({ msg: 'Error creating staff', error: error.message });
  }
};

// show employer staff to their admin only
export const getAllEmployerStaff = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employer_admin') {
      query = {
        companyId: new mongoose.Types.ObjectId(req.user.companyId),
        role: 'employer_staff',
        adminId: req.user._id,
      };
    } else {
      query = { _id: req.user._id };
    }

    const users = await employerUserModel.find(query).select('-password');

    res.status(200).json({
      message: 'Employer staff fetched successfully',
      totalStaff: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employer staff
export const updateEmployerStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, email, phone, permissions, isActive } = req.body;

    let query = { _id: staffId, role: 'employer_staff' };

    // If employer_admin, restrict to their company + created staff
    if (req.user.role === 'employer_admin') {
      query.companyId = new mongoose.Types.ObjectId(req.user.companyId);
      query.adminId = req.user._id;
    }

    const updatedStaff = await employerUserModel.findOneAndUpdate(
      query,
      { $set: { name, email, phone, permissions, isActive } },
      { new: true, runValidators: true, select: '-password' },
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found or not authorized' });
    }

    res.status(200).json({
      message: 'Employer staff updated successfully',
      updatedStaff,
    });
  } catch (error) {
    console.error('updateEmployerStaff error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete employer staff
export const deleteEmployerStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    let query = { _id: staffId, role: 'employer_staff' };

    if (req.user.role === 'employer_admin') {
      query.companyId = new mongoose.Types.ObjectId(req.user.companyId);
      query.adminId = req.user._id;
    }

    const deletedStaff = await employerUserModel.findOneAndDelete(query);

    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff not found or not authorized' });
    }

    res.status(200).json({
      message: 'Employer staff deleted successfully',
      deletedStaff,
    });
  } catch (error) {
    console.error('deleteEmployerStaff error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
