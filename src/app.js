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
import hotVacancyJobsRoutes from './routes/hotVacancyJobsRoutes.js';
import internshipJobsRoutes from './routes/internshipJobsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadExcel from './routes/uploadExcelRoutes.js';
import jobApplication from './routes/jobApplicationRoutes.js';
import otpRoutes from './routes/otpVerificationRoutes.js';
import uploadResume from './routes/resumeRoutes.js';
import searchRoutes from './routes/searchFilterRoutes.js';
const app = express();

// app.use(helmet());
// app.use(cors());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json('API is running');
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/jobs/applications', jobApplication);
app.use('/api/jobs', hotVacancyJobsRoutes);
app.use('/api/internship', internshipJobsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resume', uploadResume);
app.use('/otp', otpRoutes);
app.use('/api/excel', uploadExcel);
app.use('/api/search', searchRoutes);

export default app;
