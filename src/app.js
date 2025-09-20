import express from 'express';
import adminRoutes from './routes/admin.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditLogRoutes from './routes/auditLogs.routes.js';
import companyRoutes from './routes/company.routes.js';
import subscriptionPaymentRoutes from './routes/subscriptionPayment.routes.js';
import BuySubScriptionRoutes from './routes/subscription.routes.js';
import employerRoute from './routes/employer.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json('API is running');
});
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditLogRoutes);
app.use('/api/select-category-plan', BuySubScriptionRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/subscription-payment', subscriptionPaymentRoutes);
app.use('/api/employer', employerRoute);

export default app;
