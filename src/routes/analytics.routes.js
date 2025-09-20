// // routes/analytics.routes.js
// import express from "express";
// import { auth } from "../middleware/auth.js";
// import { rbac } from "../middleware/rbac.js";
// import { revenueReport } from "../controllers/analytics.controller.js";

// const router = express.Router();
// router.get("/revenue", auth, rbac(["owner","superadmin"]), revenueReport);
// export default router;

import express from 'express';
import { activeSubscriptions, monthlyRevenue } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/monthly-revenue', monthlyRevenue);
router.get('/active-subscriptions', activeSubscriptions);

export default router;
