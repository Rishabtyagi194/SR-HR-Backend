import { generateToken } from '../config/jwt.js';
import { authenticateConsultant, getAllConsultant, registerConsultantAgency } from '../services/consultantRegistrationService.js';


export const registerAgency = async (req, res) => {
  try {
    const result = await registerConsultantAgency(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login controller
export const loginConsultant = async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log('BODY:', req.body);
    
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }

    const result = await authenticateConsultant(username, password, req.ip, req.headers['user-agent']);

    const token = generateToken({
      id: result.id,
      email: result.email,
      role: result.role,
      organisation_id: result.organisation_id,
    });

    res.json({
      success: true,
      token,
      message: 'Login successful',
      data: {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: result.role,
        organisation_id: result.organisation_id,
        last_login: new Date(),
        login_history: result.loginHistory,
      },
    });
  } catch (err) {
    console.error(' Login Error:', err);
    res.status(401).json({ success: false, message: err.message });
  }
};

// get all consultant
export const getAllConsultants = async (req, res) => {
  try {
    const consultants = await getAllConsultant();

    res.status(200).json({
      message: 'Consultants fetched successfully',
      totalConsultant: consultants.length,
      consultants: consultants.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        is_owner: c.is_owner,
        is_active: c.is_active,
        last_login: c.last_login,
        created_at: c.created_at,
        organisation_id: c.organisation_id,
        agency_name: c.agency_name,
        agency_status: c.agency_status,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch consultants',
      error: error.message,
    });
  }
};
