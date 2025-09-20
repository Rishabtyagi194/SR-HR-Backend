// controllers/plans.controller.js
import auditLogModel from '../models/auditLog.model.js';
import subscriptionCategoryModel from '../models/subscriptionPlan.model.js';

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, plans } = req.body;

    const category = await subscriptionCategoryModel.create({
      name,
      slug,
      description,
      plans,
    });

    // audit log
    await auditLogModel.create({
      actorId: req.user?.id,
      actorType: req.user?.role || 'system',
      action: 'create_category',
      targetCollection: 'Category',
      targetId: category._id,
      details: { after: category.toObject() },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Slug already exists' });
    return res.status(500).json({ msg: 'Error creating plan', error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await subscriptionCategoryModel.find({ isActive: true });
    return res.status(200).json({
      message: 'Fethced all categories',
      totalPlans: categories.length,
      categories,
    });
  } catch (err) {
    return res.status(500).json({ msg: 'Error fetching categories', error: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await subscriptionCategoryModel.findById(id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    return res.status(200).json({ category });
  } catch (err) {
    return res.status(500).json({ msg: 'Error fetching category', error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingCategory = await subscriptionCategoryModel.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // console.log('existingCategory', existingCategory);

    const beforeUpdating = existingCategory.toObject();
    // console.log('beforeUpdating', beforeUpdating);

    Object.keys(updates).forEach((key) => {
      existingCategory[key] = updates[key];
    });

    const updatedCategory = await existingCategory.save();
    // console.log('updatedCategory', updatedCategory);

    // audit log
    await auditLogModel.create({
      actorId: req.user?.id,
      actorType: req.user?.role || 'system',
      action: 'update_category',
      targetCollection: 'Category',
      targetId: updatedCategory._id,
      details: {
        before: beforeUpdating,
        after: updatedCategory.toObject(),
      },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json(updatedCategory);
  } catch (err) {
    return res.status(500).json({ msg: 'Error updating category', error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await subscriptionCategoryModel.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // audit log
    await auditLogModel.create({
      actorId: req.user?.id,
      actorType: req.user?.role || 'system',
      action: 'delete_category',
      targetCollection: 'Category',
      targetId: category._id,
      details: { before: category.toObject() },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({ msg: 'Category deleted' });
  } catch (err) {
    return res.status(500).json({ msg: 'Error deleting category', error: err.message });
  }
};

// add ,update, delete plan inside category

// add plan inside category
export const addPlanToCategory = async (req, res) => {
  try {
    const { id } = req.params; // categoryId
    const planData = req.body;

    const category = await subscriptionCategoryModel.findById(id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    category.plans.push(planData);
    await category.save();

    return res.status(201).json(category);
  } catch (err) {
    return res.status(500).json({ msg: 'Error adding plan', error: err.message });
  }
};

// Update specific plan inside category
export const updatePlanInCategory = async (req, res) => {
  try {
    const { id, planId } = req.params; // categoryId, planId
    const updates = req.body;

    const category = await subscriptionCategoryModel.findById(id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    const plan = category.plans.id(planId);
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });

    const beforeUpdating = plan.toObject();

    Object.keys(updates).forEach((key) => {
      plan[key] = updates[key];
    });

    await category.save();

    // audit log
    await auditLogModel.create({
      actorId: req.user?.id,
      actorType: req.user?.role || 'system',
      action: 'update_plan',
      targetCollection: 'Category',
      targetId: category._id,
      details: {
        before: beforeUpdating,
        after: plan.toObject(),
      },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json(plan);
  } catch (err) {
    return res.status(500).json({ msg: 'Error updating plan', error: err.message });
  }
};

// Delete specific plan inside category
export const deletePlanFromCategory = async (req, res) => {
  try {
    const { id, planId } = req.params; // categoryId, planId

    const category = await subscriptionCategoryModel.findById(id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    const plan = category.plans.id(planId); //plans is an array of subdocuments
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });

    const beforeSnapshot = plan.toObject();

    plan.deleteOne();
    await category.save();

    // audit log
    await auditLogModel.create({
      actorId: req.user?.id,
      actorType: req.user?.role || 'system',
      action: 'delete_plan',
      targetCollection: 'Category',
      targetId: category._id,
      details: { before: beforeSnapshot },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({ msg: 'Plan deleted' });
  } catch (err) {
    return res.status(500).json({ msg: 'Error deleting plan', error: err.message });
  }
};
