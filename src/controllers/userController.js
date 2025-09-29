import userService from '../services/userService.js';

// Register new user
export const register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};
