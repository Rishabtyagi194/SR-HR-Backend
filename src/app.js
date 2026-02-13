import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';

// Import routes
import adminRoutes from './routes/superAdminRoutes.js';
// import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadExcel from './routes/uploadExcelRoutes.js';
import jobApplication from './routes/jobApplicationRoutes.js';
import otpRoutes from './routes/otpVerificationRoutes.js';
import uploadResume from './routes/resumeRoutes.js';
import searchRoutes from './routes/searchFilterRoutes.js';
import saveJobsRoutes from './routes/savedJobRoutes.js';
import LocationRoutes from './routes/locationRoutes.js';
import contactUsRoutes from './routes/contactUsRoutes.js';
import loginWithGoogleRoutes from './routes/loginWithGoogleRoutes.js'

const app = express();

// app.use(cors());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',

      // for employer
      'http://qa.employer.rozgardwar.cloud',
      'https://qa.employer.rozgardwar.cloud',

      'http://employer.rozgardwar.cloud',
      'https://employer.rozgardwar.cloud',

      // for consultant
      'http://qa.consultant.rozgardwar.cloud',
      'https://qa.consultant.rozgardwar.cloud',

      'http://consultant.rozgardwar.cloud',
      'https://consultant.rozgardwar.cloud',

      // for user
      'http://rozgardwar.cloud',
      'https://rozgardwar.cloud',

      'http://qa.rozgardwar.cloud',
      'https://qa.rozgardwar.cloud',
    ],
    credentials: true,
  }),
);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json('API is running');
});

app.use(passport.initialize());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/organization', organizationRoutes);

app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/jobs/applications', jobApplication);

app.use('/api/users', userRoutes);
app.use('/api/resume', uploadResume);

app.use('/otp', otpRoutes);
app.use('/api/excel', uploadExcel);
app.use('/api/search', searchRoutes);

app.use('/api/savejob', saveJobsRoutes);
app.use('/api/location', LocationRoutes);

app.use('/api/contcat-us', contactUsRoutes);

app.use('/api/google', loginWithGoogleRoutes);

export default app;
