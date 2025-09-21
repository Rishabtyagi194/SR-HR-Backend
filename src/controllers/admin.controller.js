// controllers/admin.controller.js

import AdminModel from '../models/admin.model.js';
import { generateToken } from '../config/jwt.js';
import employerUserModel from '../models/employerUser.model.js';
// import companyModel from '../models/company.model.js';
// import auditLogModel from '../models/auditLog.model.js';

export const AdminSignup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    // Prevent duplicate accounts
    const existing = await AdminModel.findOne({
      $or: [
        {
          email: email.trim().toLowerCase(),
        },
        { phone },
      ],
    });

    if (existing) {
      return res.status(400).json({ msg: 'Email/Phone already exist' });
    }

    const newAdmin = await AdminModel.create({
      name,
      email,
      phone,
      password,
      role,
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ msg: 'Error creating new admin', error: error.message });
  }
};

// super admin login
export const AdminLogin = async (req, res) => {
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

  const admin = await AdminModel.findOne(query);

  if (!admin) {
    return res.status(400).json({ msg: 'Invalid username or password' });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  admin.lastLogin = new Date();
  await admin.save();

  const token = generateToken(admin);

  res.status(200).json({
    message: 'Login successful',
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  });
};

// supr admin can see all employers and staff of all companies
export const getAllEmployersAndStaff = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      companyId,
      isActive,
      name, // optional search by employer name
    } = req.query;

    const query = {};

    if (companyId) {
      query.companyId = companyId;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // case-insensitive search
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: order === 'asc' ? 1 : -1 },
      populate: { path: 'companyId' },
    };

    // Pagination logic
    const skip = (options.page - 1) * options.limit;

    const [employers, total] = await Promise.all([
      employerUserModel.find(query).select('-password').populate(options.populate).sort(options.sort).skip(skip).limit(options.limit),
      employerUserModel.countDocuments(query),
    ]);

    return res.status(200).json({
      message: 'Employers fetched successfully',
      totalEmployers: total,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      employers,
    });
  } catch (err) {
    console.error('getAllEmployers error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// export const suspendCompany = async (req, res) => {
//   const companyId = req.params.id;
//   const company = await companyModel.findByIdAndUpdate(companyId, { status: 'suspended' }, { new: true });
//   await auditLogModel.create({
//     actorId: req.user.id,
//     action: 'suspend_company',
//     targetCollection: 'Company',
//     targetId: company._id,
//     details: { reason: req.body.reason || 'suspended by admin' },
//   });
//   // optionally: enqueue email job to company contact
//   return res.json({ success: true, company });
// };
