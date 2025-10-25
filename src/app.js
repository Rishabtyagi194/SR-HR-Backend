import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import adminRoutes from './routes/superAdminRoutes.js';
// import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import jobsRoutes from './routes/jobsRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// app.use(helmet());
app.use(cors());
// app.use(
//   cors({
//     origin: 'https://sr-hrportal.netlify.app',
//     credentials: true,
//   }),
// );
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json('API is running');
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/employer', employerRoutes);
// app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/users', userRoutes);


// app.use('/api/jobs', jobRoutes);
>>>>>>> 25f851ac7d721537ea311ef8d52d1e578de77e08

export default app;
