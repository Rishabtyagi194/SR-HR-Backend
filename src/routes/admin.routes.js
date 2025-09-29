// import express from 'express';
// // import { AdminLogin, AdminSignup } from '../controllers/admin.controller.js';
// import {
//   addPlanToCategory,
//   createCategory,
//   deleteCategory,
//   deletePlanFromCategory,
//   getCategories,
//   getCategoryById,
//   updateCategory,
//   updatePlanInCategory,
// } from '../controllers/subscriptionPlans.controller.js';
// import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Admin signup/signin
// // router.post('/signup', AdminSignup);
// // router.post('/signin', AdminLogin);

// //Subscription plan provided by super Admin(Owner of the App)
// // categories
// router.post('/categories', Authenticate, authorizeRoles('super_admin'), createCategory);
// router.get('/categories', getCategories); // not authenticate, visible to everyone
// router.get('/categories/:id', getCategoryById);
// router.patch('/categories/:id', Authenticate, authorizeRoles('super_admin'), updateCategory);
// router.delete('/categories/:id', Authenticate, authorizeRoles('super_admin'), deleteCategory);

// // plans inside category
// router.post('/categories/:id/plans', Authenticate, authorizeRoles('super_admin'), addPlanToCategory); //Add a new plan inside a category
// router.patch('/categories/:id/plans/:planId', Authenticate, authorizeRoles('super_admin'), updatePlanInCategory); // Update a specific plan
// router.delete('/categories/:id/plans/:planId', Authenticate, authorizeRoles('super_admin'), deletePlanFromCategory); // Delete a specific plan

// // router.get('/get-employers', Authenticate, authorizeRoles('super_admin'), getAllEmployersAndStaff); // only super admin can see all employers

// export default router;
