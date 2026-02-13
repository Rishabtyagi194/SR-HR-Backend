import express from 'express';


import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

/* ---------------------- login with google ------------------------------------*/ 

router.get('/auth/google', (req, res, next) => {
  const { type } = req.query;

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: type, // pass role
  })(req, res, next);
});


router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const loginType = req.query.state; // job_seeker | employer | consultant

    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        organisation_id: req.user.organisation_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let redirectBaseUrl = process.env.USER_CLIENT_URL;

    if (loginType === 'employer') {
      redirectBaseUrl = process.env.EMPLOYER_CLIENT_URL;
    } else if (loginType === 'consultant') {
      redirectBaseUrl = process.env.CONSULTANT_CLIENT_URL;
    }

    return res.redirect(
      `${redirectBaseUrl}/auth/callback?token=${token}`
    );
  }
);



export default router