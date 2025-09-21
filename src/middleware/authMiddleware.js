import jwt from 'jsonwebtoken';

export const Authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) return res.status(401).send();
  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // contains id + role + permissions
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Forbidden: Access denied' });
    }
    next();
  };
};

// // middleware/authMiddleware.js
// import dotenv from "dotenv";
// dotenv.config();
// import jwt from "jsonwebtoken";
// import userModel from "../models/userModel.js";

// export const Authenticate = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await userModel.findById(decoded.id).lean();

//     if (!user) return res.status(401).json({ msg: "Invalid user" });

//     // Ensure organisationId and adminId are always set
//     req.user = {
//       _id: user._id,
//       role: user.role,
//       organisationId: user.organisationId,
//       adminId: user.role === "admin" ? user._id : user.adminId,
//       email: user.email
//     };

//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token is not valid", error: err.message });
//   }
// };

// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ msg: "Access denied" });
//     }
//     next();
//   };
// };
