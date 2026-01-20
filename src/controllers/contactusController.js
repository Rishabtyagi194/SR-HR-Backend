import { CONTACT_LEADS_ALLOWED_EMAILS } from '../constants/adminEmails.js';
import contactUsServices from '../services/contactUsServices.js';

export const contactUsController = async (req, res) => {
  try {
    const { name, email, mobileNo, areaOfConcern, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: 'Name, email and message are required',
      });
    }

    const result = await contactUsServices.create({
      name,
      email,
      mobileNo,
      areaOfConcern,
      message,
    });

    res.status(201).json({
      message: 'Successfully sent',
      result,
    });
  } catch (error) {
    console.error('Contact Us Error:', error);
    res.status(500).json({
      message: 'Something went wrong',
    });
  }
};

export const getcontactUsController = async (req, res) => {
  try {

    const userEmail =  req.user?.email;

    if (!userEmail || !CONTACT_LEADS_ALLOWED_EMAILS.includes(userEmail) ) {
        return res.status(403).json({
            message: "You don't have access."
        })
    }


    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const result = await contactUsServices.getAll({ limit, offset });

    res.status(200).json({
      message: 'Leads fetched successfully',
      page,
      limit,
      total: result.total,
      data: result.data,
    });
  } catch (error) {
    console.error('Get Contact Leads Error:', error);
    res.status(500).json({
      message: 'Something went wrong',
    });
  }
};