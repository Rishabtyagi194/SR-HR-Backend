import { validationResult } from "express-validator";
import consultantService from "../services/consultantService.js";


export const registerConsultant = async (req, res) =>{
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const result = await consultantService.register(req.body);
        res.status(201).json({
            success: true, 
            data: result
        })
    } catch (error) {
        console.error('Register Error:', err);
        res.status(500).json({ success: false, message: err.message });    }
}

// Login controller
export const loginConsultant = async (req, res) => {
  try {
    const result = await consultantService.login(req.body);
    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    console.error(' Login Error:', err);
    res.status(401).json({ success: false, message: err.message });
  }
};