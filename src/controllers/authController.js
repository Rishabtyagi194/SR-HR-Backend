// src/controllers/authController.js
import authService from '../services/authService.js';

export const EmployerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }

    const { employer, token } = await authService.authenticateEmployer(username, password, req.ip, req.headers['user-agent']);

    res.status(200).json({
      message: 'Login successful',
      token,
      employer: {
        id: employer.id,
        name: employer.name,
        email: employer.email,
        phone: employer.phone,
        role: employer.role,
        last_login: employer.last_login,
        is_active: employer.is_active,
        permissions: employer.permissions,
      },
    });
  } catch (error) {
    if (error.message === 'Account is inactive. Please contact support.') {
      return res.status(403).json({ msg: error.message });
    }
    res.status(401).json({ message: error.message });
  }
};
