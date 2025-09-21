import jwt from 'jsonwebtoken';

export const generateToken = (admin) => {
  return jwt.sign(
    {
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      companyId: admin.companyId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
