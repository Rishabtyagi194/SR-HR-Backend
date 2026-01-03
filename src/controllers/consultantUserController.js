import { validationResult } from "express-validator";


export const consultantUserController = async (req, res) =>{
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