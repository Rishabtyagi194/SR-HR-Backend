import { getKeywordSuggestions } from '../services/redisService.js';
// import { generateText } from '../services/ollamaService.js';
import { getReadPool } from '../config/database.js';
import { generateKeywords } from '../services/llmService.js';

// export const searchKeywordController = async (req, res) => {
//   try {
//     const { keywords = [], minExpYears, maxExpYears, location, preferredLocation, noticePeriod, expectedSalary, boolean } = req.body;

//     const employerId = req.user.id;
//     const companyId = req.user.company_id;

//     const mainKeyword = keywords[0] || null;
//     let query = `
//   SELECT
//     users.id AS user_id,
//     users.full_name,
//     users.email,
//     ANY_VALUE(user_profiles.profile_title) AS profile_title,
//     ANY_VALUE(user_profiles.about_me) AS about_me,
//     ANY_VALUE(user_profiles.current_location) AS current_location,
//     ANY_VALUE(user_profiles.preferred_location) AS preferred_location,
//     ANY_VALUE(user_profiles.total_experience_years) AS total_experience_years,
//     ANY_VALUE(user_profiles.total_experience_months) AS total_experience_months,
//     ANY_VALUE(user_profiles.expected_salary) AS expected_salary,
//     ANY_VALUE(user_profiles.notice_period) AS notice_period,
//     GROUP_CONCAT(DISTINCT user_skills.skill_name) AS skills,
//     ANY_VALUE(job_applications.applied_at) AS applied_at,
//     ANY_VALUE(job_applications.hotvacancy_job_id) AS hotvacancy_job_id,
//     ANY_VALUE(job_applications.internship_job_id) AS internship_job_id

//   FROM users
//   JOIN job_applications ON users.id = job_applications.user_id
//   LEFT JOIN user_profiles ON users.id = user_profiles.user_id
//   LEFT JOIN user_skills ON users.id = user_skills.user_id
//   WHERE job_applications.company_id = ?
// `;

//     const params = [companyId];

//     if (mainKeyword) {
//       query += ` AND (user_profiles.profile_title LIKE ? OR user_skills.skill_name LIKE ?)`;
//       params.push(`%${mainKeyword}%`, `%${mainKeyword}%`);
//     }

//     if (location) {
//       query += ` AND user_profiles.current_location LIKE ?`;
//       params.push(`%${location}%`);
//     }

//     if (preferredLocation) {
//       query += ` AND user_profiles.preferred_location LIKE ?`;
//       params.push(`%${preferredLocation}%`);
//     }

//     if (minExpYears) {
//       query += ` AND user_profiles.total_experience_years >= ?`;
//       params.push(minExpYears);
//     }

//     if (maxExpYears) {
//       query += ` AND user_profiles.total_experience_years <= ?`;
//       params.push(maxExpYears);
//     }

//     if (expectedSalary) {
//       query += ` AND user_profiles.expected_salary <= ?`;
//       params.push(expectedSalary);
//     }

//     if (noticePeriod) {
//       query += ` AND user_profiles.notice_period <= ?`;
//       params.push(noticePeriod);
//     }

//     query += ` GROUP BY users.id LIMIT 50`;

//     const [resumes] = await getReadPool().execute(query, params);
//     console.log('resumes', resumes);

//     return res.json({
//       success: true,
//       total: resumes.length,
//       applicants: resumes,
//     });
//   } catch (err) {
//     console.error('Search error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// export const searchKeywordController = async (req, res) => {
//   try {
//     const {
//       keywords = [],           // ["node", "react"]
//       skills = [],             // ["Node.js", "React"]
//       experience = {},         // { min: 2, max: 5 } (years)
//       currentLocation,
//       preferredLocation,
//       noticePeriod,            // e.g. ["0-15 days", "1 month"]
//       expectedSalary,          // max salary (LPA)
//       boolean = "AND",         // AND / OR between keywords
//     } = req.body;

//     const companyId = req.user.company_id;

//     let query = `
//       SELECT
//         users.id AS user_id,
//         users.full_name,
//         users.email,
//         MAX(user_profiles.profile_title) AS profile_title,
//         MAX(user_profiles.about_me) AS about_me,
//         MAX(user_profiles.current_location) AS current_location,
//         MAX(user_profiles.preferred_location) AS preferred_location,
//         MAX(user_profiles.total_experience_years) AS total_experience_years,
//         MAX(user_profiles.total_experience_months) AS total_experience_months,
//         MAX(user_profiles.expected_salary) AS expected_salary,
//         MAX(user_profiles.notice_period) AS notice_period,
//         GROUP_CONCAT(DISTINCT user_skills.skill_name) AS skills,
//         MAX(job_applications.applied_at) AS applied_at
//       FROM users
//       JOIN job_applications
//         ON users.id = job_applications.user_id
//       LEFT JOIN user_profiles
//         ON users.id = user_profiles.user_id
//       LEFT JOIN user_skills
//         ON users.id = user_skills.user_id
//       WHERE job_applications.company_id = ?
//     `;

//     const params = [companyId];

//     /* ---------------- KEYWORDS (profile title / about / skills) ---------------- */
//     if (keywords.length) {
//       const conditions = keywords.map(() =>
//         `(user_profiles.profile_title LIKE ?
//           OR user_profiles.about_me LIKE ?
//           OR user_skills.skill_name LIKE ?)`
//       );

//       query += ` AND (${conditions.join(` ${boolean} `)})`;

//       keywords.forEach((kw) => {
//         const val = `%${kw}%`;
//         params.push(val, val, val);
//       });
//     }

//     /* ---------------- SKILLS (exact match) ---------------- */
//     if (skills.length) {
//       query += `
//         AND EXISTS (
//           SELECT 1 FROM user_skills us
//           WHERE us.user_id = users.id
//           AND us.skill_name IN (${skills.map(() => '?').join(',')})
//         )
//       `;
//       params.push(...skills);
//     }

//     /* ---------------- EXPERIENCE (years → months) ---------------- */
//     if (experience.min || experience.max) {
//       query += `
//         AND (
//           user_profiles.total_experience_years * 12 +
//           user_profiles.total_experience_months
//         ) BETWEEN ? AND ?
//       `;

//       const minMonths = (experience.min || 0) * 12;
//       const maxMonths = (experience.max || 50) * 12;

//       params.push(minMonths, maxMonths);
//     }

//     /* ---------------- LOCATION (current OR preferred) ---------------- */
//     if (currentLocation || preferredLocation) {
//       query += ` AND (`;
//       const locConditions = [];

//       if (currentLocation) {
//         locConditions.push(`user_profiles.current_location LIKE ?`);
//         params.push(`%${currentLocation}%`);
//       }

//       if (preferredLocation) {
//         locConditions.push(`user_profiles.preferred_location LIKE ?`);
//         params.push(`%${preferredLocation}%`);
//       }

//       query += locConditions.join(' OR ') + `)`;
//     }

//     /* ---------------- SALARY ---------------- */
//     if (expectedSalary) {
//       query += ` AND user_profiles.expected_salary <= ?`;
//       params.push(expectedSalary);
//     }

//     /* ---------------- NOTICE PERIOD ---------------- */
//     if (noticePeriod?.length) {
//       query += `
//         AND user_profiles.notice_period IN (${noticePeriod.map(() => '?').join(',')})
//       `;
//       params.push(...noticePeriod);
//     }

//     /* ---------------- FINAL ---------------- */
//     query += `
//       GROUP BY users.id
//       ORDER BY applied_at DESC
//       LIMIT 50
//     `;

//     const [resumes] = await getReadPool().execute(query, params);

//     return res.json({
//       success: true,
//       total: resumes.length,
//       applicants: resumes,
//     });

//   } catch (err) {
//     console.error('Search error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
export const searchKeywordController = async (req, res) => {
  try {
    const {
      keywords = [],
      boolean = 'AND',

      skills = [],
      experience,

      currentLocations = [],
      includeRelocation = false,
      excludeAnywhere = false,

      minSalary,
      maxSalary,
      includeNoSalary = false,

      department,
      industry,
      company,
      excludeCompany = [],
      designation,

      noticePeriod = [],

      ug,
      pg,

      gender,
      pwdOnly,
      candidateCategory,
      minAge,
      maxAge,

      jobType,
      employmentType,
      workPermit,

      showCandidates,
      verifiedMobile,
      verifiedEmail,
      attachedResume,
    } = req.body;

    let query = `
      SELECT DISTINCT
        u.id,
        MAX(u.full_name) AS full_name,
        MAX(u.email) AS email,
        MAX(up.profile_title) AS profile_title,
        MAX(up.current_location) AS current_location,
        MAX(up.preferred_location) AS preferred_location,
        MAX(up.expected_salary) AS expected_salary,
        MAX(up.notice_period) AS notice_period,
        MAX(up.total_experience_years) AS total_experience_years,
        MAX(up.total_experience_months) AS total_experience_months,
        GROUP_CONCAT(DISTINCT us.skill_name) AS skills
      FROM users u
      JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN user_skills us ON us.user_id = u.id
      WHERE u.is_active = 1
    `;

    const params = [];

    /* ---------- KEYWORDS ---------- */
    if (keywords.length) {
      const blocks = keywords.map(() => `(up.profile_title LIKE ? OR us.skill_name LIKE ?)`);
      query += ` AND (${blocks.join(` ${boolean} `)})`;
      keywords.forEach((k) => params.push(`%${k}%`, `%${k}%`));
    }

    /* ---------- SKILLS ---------- */
    if (skills.length) {
      query += `
        AND EXISTS (
          SELECT 1 FROM user_skills s
          WHERE s.user_id = u.id
          AND s.skill_name IN (${skills.map(() => '?').join(',')})
        )
      `;
      params.push(...skills);
    }

    /* ---------- EXPERIENCE ---------- */
    if (typeof experience === 'number') {
      query += `
        AND (
          up.total_experience_years * 12 +
          up.total_experience_months
        ) >= ?
      `;
      params.push(experience * 12);
    }

    /* ---------- LOCATION ---------- */
    if (currentLocations.length) {
      if (includeRelocation) {
        query += `
          AND (
            up.current_location IN (${currentLocations.map(() => '?').join(',')})
            OR up.preferred_location IN (${currentLocations.map(() => '?').join(',')})
          )
        `;
        params.push(...currentLocations, ...currentLocations);
      } else {
        query += `
          AND up.current_location IN (${currentLocations.map(() => '?').join(',')})
        `;
        params.push(...currentLocations);
      }
    }

    if (excludeAnywhere) {
      query += `
        AND up.current_location <> 'Anywhere'
        AND up.preferred_location <> 'Anywhere'
      `;
    }

    /* ---------- SALARY ---------- */
    if (minSalary || maxSalary) {
      query += ` AND (`;

      const salaryParts = [];

      if (minSalary) {
        salaryParts.push(`CAST(up.expected_salary AS UNSIGNED) >= ?`);
        params.push(minSalary);
      }

      if (maxSalary) {
        salaryParts.push(`CAST(up.expected_salary AS UNSIGNED) <= ?`);
        params.push(maxSalary);
      }

      query += salaryParts.join(' AND ');

      if (includeNoSalary) {
        query += ` OR up.expected_salary IS NULL`;
      }

      query += `)`;
    }

    /* ---------- NOTICE PERIOD ---------- */
    if (noticePeriod.length) {
      query += `
        AND up.notice_period IN (${noticePeriod.map(() => '?').join(',')})
      `;
      params.push(...noticePeriod);
    }

    /* ---------- EXPERIENCE BASED FILTERS ---------- */
    const expExists = (condition, value) => {
      query += `
        AND EXISTS (
          SELECT 1 FROM user_experience e
          WHERE e.user_id = u.id
          AND ${condition}
        )
      `;
      params.push(value);
    };

    if (designation) expExists(`e.job_title LIKE ?`, `%${designation}%`);
    if (department) expExists(`e.department LIKE ?`, `%${department}%`);
    if (industry) expExists(`e.industry LIKE ?`, `%${industry}%`);
    if (company) expExists(`e.company_name LIKE ?`, `%${company}%`);

    if (excludeCompany.length) {
      query += `
        AND NOT EXISTS (
          SELECT 1 FROM user_experience e
          WHERE e.user_id = u.id
          AND e.company_name IN (${excludeCompany.map(() => '?').join(',')})
        )
      `;
      params.push(...excludeCompany);
    }

    if (jobType) expExists(`e.job_type = ?`, jobType);
    if (employmentType) expExists(`e.employment_type = ?`, employmentType);

    /* ---------- EDUCATION ---------- */
    if (ug?.mode === 'specific') {
      query += `
        AND EXISTS (
          SELECT 1 FROM user_education e
          WHERE e.user_id = u.id
          AND e.degree = ?
        )
      `;
      params.push(ug.course);
    }

    if (pg?.mode === 'specific') {
      query += `
        AND EXISTS (
          SELECT 1 FROM user_education e
          WHERE e.user_id = u.id
          AND e.degree = ?
        )
      `;
      params.push(pg.course);
    }

    /* ---------- DIVERSITY ---------- */
    if (gender && gender !== 'all') {
      query += ` AND up.gender = ?`;
      params.push(gender);
    }

    if (pwdOnly) {
      query += ` AND up.is_pwd = 1`;
    }

    /* ---------- CATEGORY ---------- */
    if (candidateCategory === 'fresher') {
      query += ` AND up.total_experience_years = 0 AND up.total_experience_months = 0`;
    }

    if (candidateCategory === 'experienced') {
      query += ` AND (up.total_experience_years > 0 OR up.total_experience_months > 0)`;
    }

    /* ---------- AGE ---------- */
    if (minAge) {
      query += `
        AND up.dob IS NOT NULL
        AND TIMESTAMPDIFF(YEAR, up.dob, CURDATE()) >= ?
      `;
      params.push(minAge);
    }

    if (maxAge) {
      query += `
        AND up.dob IS NOT NULL
        AND TIMESTAMPDIFF(YEAR, up.dob, CURDATE()) <= ?
      `;
      params.push(maxAge);
    }

    /* ---------- PERMIT ---------- */
    if (workPermit) {
      query += ` AND up.country = ?`;
      params.push(workPermit);
    }

    /* ---------- META ---------- */
    if (showCandidates === 'new') {
      query += ` AND u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    }

    if (showCandidates === 'modified') {
      query += ` AND u.updated_at > u.created_at`;
    }

    if (verifiedMobile) query += ` AND u.is_mobile_verified = 1`;
    if (verifiedEmail) query += ` AND u.is_email_verified = 1`;
    if (attachedResume) query += ` AND up.resume_url IS NOT NULL`;

    query += `
      GROUP BY u.id
      ORDER BY u.updated_at DESC
      LIMIT 50
    `;

    const [rows] = await getReadPool().execute(query, params);

    res.json({ success: true, total: rows.length, applicants: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// export const searchKeywordController = async (req, res) => {
//   try {
//     const {
//       keywords = [],
//       boolean = 'AND',

//       skills = [],
//       experience,

//       currentLocations = [],
//       includeRelocation = false,
//       excludeAnywhere = false,

//       minSalary,
//       maxSalary,
//       includeNoSalary = false,

//       department,
//       industry,
//       company,
//       excludeCompany = [],
//       designation,

//       noticePeriod = [],

//       ug,
//       pg,

//       gender,
//       pwdOnly,
//       candidateCategory,
//       minAge,
//       maxAge,

//       jobType,
//       employmentType,
//       workPermit,

//       showCandidates,
//       verifiedMobile,
//       verifiedEmail,
//       attachedResume,
//     } = req.body;

//     let query = `
//       SELECT DISTINCT
//         u.id,
//         u.full_name,
//         u.email,
//         up.profile_title,
//         up.current_location,
//         up.preferred_location,
//         up.expected_salary,
//         up.notice_period,
//         GROUP_CONCAT(DISTINCT us.skill_name) AS skills
//       FROM users u
//       LEFT JOIN user_profiles up ON up.user_id = u.id
//       LEFT JOIN user_skills us ON us.user_id = u.id
//       LEFT JOIN user_experience ux ON ux.user_id = u.id
//       LEFT JOIN user_education ue ON ue.user_id = u.id
//       WHERE 1=1
//     `;

//     const params = [];

//     query += ` AND u.is_active = 1`;

//     /* ---------- KEYWORDS ---------- */
//     if (keywords.length) {
//       const blocks = keywords.map(() => `(up.profile_title LIKE ? OR us.skill_name LIKE ?)`);
//       query += ` AND (${blocks.join(` ${boolean} `)})`;
//       keywords.forEach((k) => {
//         params.push(`%${k}%`, `%${k}%`);
//       });
//     }

//     /* ---------- SKILLS ---------- */
//     if (skills.length) {
//       query += `
//         AND EXISTS (
//           SELECT 1 FROM user_skills s
//           WHERE s.user_id = u.id
//           AND s.skill_name IN (${skills.map(() => '?').join(',')})
//         )
//       `;
//       params.push(...skills);
//     }

//     /* ---------- EXPERIENCE (number) ---------- */
//     if (typeof experience === 'number') {
//       query += `
//         AND (
//           up.total_experience_years * 12 +
//           up.total_experience_months
//         ) >= ?
//       `;
//       params.push(experience * 12);
//     }

//     /* ---------- LOCATION ---------- */
//     if (currentLocations.length) {
//       if (includeRelocation) {
//         query += `
//           AND (
//             up.current_location IN (${currentLocations.map(() => '?').join(',')})
//             OR up.preferred_location IN (${currentLocations.map(() => '?').join(',')})
//           )
//         `;
//         params.push(...currentLocations, ...currentLocations);
//       } else {
//         query += `
//           AND up.current_location IN (${currentLocations.map(() => '?').join(',')})
//         `;
//         params.push(...currentLocations);
//       }
//     }

//     if (excludeAnywhere) {
//       query += `
//         AND up.current_location <> 'Anywhere'
//         AND up.preferred_location <> 'Anywhere'
//       `;
//     }

//     /* ---------- SALARY ---------- */
//     if (minSalary || maxSalary) {
//       query += ` AND (`;

//       const salaryParts = [];

//       if (minSalary) {
//         salaryParts.push(`CAST(up.expected_salary AS UNSIGNED) >= ?`);
//         params.push(minSalary);
//       }

//       if (maxSalary) {
//         salaryParts.push(`CAST(up.expected_salary AS UNSIGNED) <= ?`);
//         params.push(maxSalary);
//       }

//       query += salaryParts.join(' AND ');

//       if (includeNoSalary) {
//         query += ` OR up.expected_salary IS NULL`;
//       }

//       query += `)`;
//     }

//     /* ---------- NOTICE PERIOD ---------- */
//     if (noticePeriod.length) {
//       query += `
//         AND up.notice_period IN (${noticePeriod.map(() => '?').join(',')})
//       `;
//       params.push(...noticePeriod);
//     }

//     /* ---------- DESIGNATION & COMPANY ---------- */
//     if (designation) {
//       query += ` AND ux.job_title LIKE ?`;
//       params.push(`%${designation}%`);
//     }

//     if (department) {
//       query += ` AND ux.department LIKE ?`;
//       params.push(`%${department}%`);
//     }

//     if (industry) {
//       query += ` AND ux.industry LIKE ?`;
//       params.push(`%${industry}%`);
//     }

//     if (company) {
//       query += ` AND ux.company_name LIKE ?`;
//       params.push(`%${company}%`);
//     }

//     if (excludeCompany.length) {
//       query += `
//         AND ux.company_name NOT IN (${excludeCompany.map(() => '?').join(',')})
//       `;
//       params.push(...excludeCompany);
//     }

//     /* ---------- EDUCATION ---------- */
//     if (ug?.mode === 'specific') {
//       query += `
//     AND EXISTS (
//       SELECT 1 FROM user_education e
//       WHERE e.user_id = u.id
//       AND e.degree = ?
//     )
//   `;
//       params.push(ug.course);
//     }

//     if (pg?.mode === 'specific') {
//       query += `
//     AND EXISTS (
//       SELECT 1 FROM user_education e
//       WHERE e.user_id = u.id
//       AND e.degree = ?
//     )
//   `;
//       params.push(pg.course);
//     }

//     /* ---------- DIVERSITY ---------- */
//     if (gender && gender !== 'all') {
//       query += ` AND up.gender = ?`;
//       params.push(gender);
//     }

//     if (pwdOnly) {
//       query += ` AND up.is_pwd = 1`;
//     }

//     /* ---------- CANDIDATE CATEGORY ---------- */
//     if (candidateCategory === 'fresher') {
//       query += `
//         AND up.total_experience_years = 0
//         AND up.total_experience_months = 0
//       `;
//     }

//     if (candidateCategory === 'experienced') {
//       query += `
//         AND (
//           up.total_experience_years > 0
//           OR up.total_experience_months > 0
//         )
//       `;
//     }

//     /* ---------- CANDIDATE AGE ---------- */

//     if (minAge || maxAge) {
//       if (minAge) {
//         query += `
//           AND TIMESTAMPDIFF(YEAR, up.dob, CURDATE()) >= ?
//         `;
//         params.push(minAge);
//       }

//       if (maxAge) {
//         query += `
//           AND TIMESTAMPDIFF(YEAR, up.dob, CURDATE()) <= ?
//         `;
//         params.push(maxAge);
//       }
//     }

//     /* ---------- JOB TYPE ---------- */
//     if (jobType) {
//       query += ` AND ux.job_type = ?`;
//       params.push(jobType);
//     }

//     /* ---------- EMPLOYMENT TYPE ---------- */
//     if (employmentType) {
//       query += ` AND ux.employment_type = ?`;
//       params.push(employmentType);
//     }

//     /* ---------- WORK PERMIT ---------- */
//     if (workPermit) {
//       query += ` AND up.country = ?`;
//       params.push(workPermit);
//     }

//     /* ---------- SHOW CANDIDATES ---------- */
//     if (showCandidates === 'new') {
//       query += `
//         AND u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
//       `;
//     }

//     if (showCandidates === 'modified') {
//       query += `
//         AND u.updated_at > u.created_at
//       `;
//     }

//     /* ---------- Email/Phone Verified and resume ---------- */

//     if (verifiedMobile) {
//       query += ` AND u.is_mobile_verified = 1`;
//     }

//     if (verifiedEmail) {
//       query += ` AND u.is_email_verified = 1`;
//     }

//     if (attachedResume) {
//       query += ` AND up.resume_url IS NOT NULL`;
//     }

//     query += ` GROUP BY u.id LIMIT 50`;

//     const [rows] = await getReadPool().execute(query, params);

//     res.json({ success: true, total: rows.length, applicants: rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

export const suggestionController = async (req, res) => {
  try {
    const { keyword } = req.query;
    console.log('inside suggestions:', keyword);

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const value = keyword.toLowerCase().trim();

    // Redis (highest priority)
    const redisSuggestions = await getKeywordSuggestions(value);

    if (redisSuggestions.length > 0) {
      return res.json({
        source: 'redis',
        suggestions: redisSuggestions.slice(0, 10),
      });
    }

    // Database (fallback)
    const [dbRows] = await getReadPool().execute(
      `
        SELECT keyword
        FROM search_keywords_history
        WHERE keyword LIKE ?
        ORDER BY created_at DESC
        LIMIT 10
      `,
      [`${value}%`],
    );

    const dbSuggestions = dbRows.map((row) => row.keyword);

    if (dbSuggestions.length > 0) {
      return res.json({
        source: 'db',
        suggestions: dbSuggestions.slice(0, 10),
      });
    }

    // AI (Groq – last fallback)
    console.log('Calling AI for:', value);

    const aiText = await generateKeywords(value);

    const aiSuggestions = aiText
      .split(/[\n,]/)
      .map((k) =>
        k
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .trim(),
      )
      .filter(Boolean)
      .slice(0, 10);

    if (aiSuggestions.length > 0) {
      return res.json({
        source: 'ai',
        suggestions: aiSuggestions,
      });
    }

    // Nothing found
    return res.json({
      source: 'none',
      suggestions: [],
    });
  } catch (error) {
    console.error('SuggestionController error:', error.message);
    return res.json({
      source: 'error',
      suggestions: [],
    });
  }
};

// export const suggestionController = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     if (!keyword) {
//       return res.status(400).json({ message: 'Keyword is required' });
//     }

//     // Redis
//     const redisSuggestions = await getKeywordSuggestions(keyword);
//     if (redisSuggestions.length >= 5) {
//       return res.json({ suggestions: redisSuggestions.slice(0, 10) });
//     }
//     console.log("redisSuggestions", redisSuggestions);

//     // DB
//     const [dbRows] = await getReadPool().execute(`SELECT keyword FROM search_keywords_history WHERE keyword LIKE ? LIMIT 10`, [
//       `${keyword.toLowerCase()}%`,
//     ]);

//     const dbSuggestions = dbRows.map((r) => r.keyword);

//     if (redisSuggestions.length + dbSuggestions.length >= 5) {
//       return res.json({
//         suggestions: [...new Set([...redisSuggestions, ...dbSuggestions])].slice(0, 10),
//       });
//     }

//     const result = await generateKeywords(keyword);

//     // Convert text → array
//     const keywords = result
//       .split(/[\n,]/)
//       .map((k) => k.trim())
//       .filter(Boolean);

//     res.json({ suggestions: keywords });
//   } catch (error) {
//     console.error('Groq error:', error.message);
//     res.status(500).json({ message: 'Failed to generate keywords' });
//   }
// };

// export const suggestionController = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     if (!keyword) {
//       return res.status(400).json({ message: 'Keyword is required' });
//     }

//     const value = keyword.toLowerCase().trim();

//     // Redis (selected keywords only)
//     const redisSuggestions = await getKeywordSuggestions(value);

//     if (redisSuggestions.length >= 5) {
//       return res.json({ suggestions: redisSuggestions.slice(0, 10) });
//     }
//       console.log("redisSuggestions keyword:::", redisSuggestions);

//     // DB (selected keywords only)
//     const [dbRows] = await getReadPool().execute(
//       `SELECT keyword FROM search_keywords_history WHERE keyword LIKE ? LIMIT 10`,
//       [`${value}%`]
//     );

//     const dbSuggestions = dbRows.map(r => r.keyword);
//     const combined = [...new Set([...redisSuggestions, ...dbSuggestions])];

//     if (combined.length >= 5) {
//       return res.json({ suggestions: combined.slice(0, 10) });
//     }

//     // Groq fallback (NO STORAGE)
//     console.log("🤖 Calling Groq for:", value);
//     const result = await generateKeywords(value);

//     const aiKeywords = result
//       .split(/[\n,]/)
//       .map(k =>
//         k
//           .toLowerCase()
//           .replace(/[^\w\s]/g, '')
//           .trim()
//       )
//       .filter(Boolean);

//     return res.json({ suggestions: aiKeywords.slice(0, 10) });

//   } catch (error) {
//     console.error('Groq error:', error.message);
//     return res.json({ suggestions: [] });
//   }
// };
