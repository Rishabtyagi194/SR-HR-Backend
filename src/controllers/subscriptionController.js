// src/controllers/subscriptionController.js
import subscriptionService from '../services/subscriptionService.js';

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, plans } = req.body;

    const category = await subscriptionService.createCategory({
      name,
      slug,
      description,
      plans,
    });

    // TODO: Add audit log implementation for MySQL
    // await auditLogService.createLog(...);

    return res.status(201).json(category);
  } catch (err) {
    if (err.message === 'Slug already exists') {
      return res.status(400).json({ msg: 'Slug already exists' });
    }
    return res.status(500).json({ msg: 'Error creating plan', error: err.message });
  }
};
