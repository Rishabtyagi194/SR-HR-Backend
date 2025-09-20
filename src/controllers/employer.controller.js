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
      id: employer._id,
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

// Get all employer users
export const getAllEmployers = async (req, res) => {
  try {
    const employers = await employerUserModel
      .find()
      .select('-password') // exclude password
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      message: 'All employers fetched successfully',
      totalEmployers: employers.length,
      employers,
    });
  } catch (err) {
    console.error('getAllEmployers error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
