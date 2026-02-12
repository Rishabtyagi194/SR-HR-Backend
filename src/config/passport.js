
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getWritePool } from './database.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/google/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const conn = await getWritePool().getConnection();
      const loginType = req.query.state; // employer | consultant | job_seeker

      try {
        await conn.beginTransaction();

        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;

        // ================= JOB SEEKER =================
        if (loginType === 'job_seeker') {
          const [existing] = await conn.execute(
            `SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1`,
            [googleId, email]
          );

          if (existing.length) {
            await conn.commit();
            return done(null, existing[0]);
          }

          const [res] = await conn.execute(
            `INSERT INTO users
             (full_name, email, password, auth_provider, google_id,
              is_email_verified, is_active, role)
             VALUES (?, ?, NULL, 'google', ?, TRUE, TRUE, 'job_seeker')`,
            [name, email, googleId]
          );

          const userId = res.insertId;

          await conn.execute(
            `INSERT INTO user_profiles (user_id) VALUES (?)`,
            [userId]
          );

          await conn.commit();
          return done(null, {
            id: userId,
            email,
            role: 'job_seeker',
          });
        }

        // ================= EMPLOYER / CONSULTANT =================
        const role =
          loginType === 'employer'
            ? 'employer_admin'
            : 'consultant_admin';

        const [empUser] = await conn.execute(
          `SELECT * FROM employer_users
           WHERE provider_id = ? OR email = ?
           LIMIT 1`,
          [googleId, email]
        );

        if (empUser.length) {
          await conn.commit();
          return done(null, empUser[0]);
        }

        // Create organisation (first time Google login)
        const [orgRes] = await conn.execute(
          `INSERT INTO organisations
           (name, contact_email, verified)
           VALUES (?, ?, TRUE)`,
          [`${name}'s Organisation`, email]
        );

        const organisationId = orgRes.insertId;

        // Create employer / consultant admin
        const [userRes] = await conn.execute(
          `INSERT INTO employer_users (
            organisation_id,
            name,
            email,
            password,
            role,
            auth_provider,
            provider_id,
            is_email_verified,
            is_active
          )
          VALUES (?, ?, ?, NULL, ?, 'google', ?, TRUE, TRUE)`,
          [
            organisationId,
            name,
            email,
            role,
            googleId,
          ]
        );

        const employerUserId = userRes.insertId;

        // Set admin_user_id
        await conn.execute(
          `UPDATE organisations
           SET admin_user_id = ?
           WHERE id = ?`,
          [employerUserId, organisationId]
        );

        await conn.commit();

        return done(null, {
          id: employerUserId,
          email,
          role,
          organisation_id: organisationId,
        });
      } catch (err) {
        await conn.rollback();
        return done(err);
      } finally {
        conn.release();
      }
    }
  )
);










// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { getWritePool } from './database.js';

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: 'http://localhost:5000/api/users/auth/google/callback',
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       const conn = await getWritePool().getConnection();
//       try {
//         await conn.beginTransaction();

//         // Try Google ID
//         const [byGoogle] = await conn.execute(
//           `SELECT * FROM users WHERE google_id = ? LIMIT 1`,
//           [profile.id]
//         );

//         if (byGoogle.length) {
//           await conn.commit();
//           return done(null, byGoogle[0]);
//         }

//         // Try Email
//         const email = profile.emails[0].value;
//         const [byEmail] = await conn.execute(
//           `SELECT * FROM users WHERE email = ? LIMIT 1`,
//           [email]
//         );

//         if (byEmail.length) {
//           // Attach Google ID to existing account
//           await conn.execute(
//             `UPDATE users
//              SET google_id = ?, auth_provider = 'google', is_email_verified = TRUE, is_active = TRUE
//              WHERE id = ?`,
//             [profile.id, byEmail[0].id]
//           );

//           await conn.commit();
//           return done(null, { ...byEmail[0], google_id: profile.id });
//         }

//         // Create new user
//         const [result] = await conn.execute(
//           `
//           INSERT INTO users (
//             full_name,
//             email,
//             password,
//             auth_provider,
//             google_id,
//             is_email_verified,
//             is_active,
//             role,
//             created_at
//           )
//           VALUES (?, ?, NULL, 'google', ?, TRUE, TRUE, 'job_seeker', NOW())
//           `,
//           [
//             profile.displayName,
//             email,
//             profile.id,
//           ]
//         );

//         const userId = result.insertId;

//         // Create empty profile
//         await conn.execute(
//           `INSERT INTO user_profiles (user_id, created_at, updated_at)
//            VALUES (?, NOW(), NOW())`,
//           [userId]
//         );

//         await conn.commit();

//         return done(null, {
//           id: userId,
//           email,
//           full_name: profile.displayName,
//           role: 'job_seeker',
//         });
//       } catch (err) {
//         await conn.rollback();
//         return done(err, null);
//       } finally {
//         conn.release();
//       }
//     }
//   )
// );
