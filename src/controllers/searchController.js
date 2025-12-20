import { getKeywordSuggestions } from '../services/redisService.js';
// import { generateText } from '../services/ollamaService.js';
import { getReadPool } from '../config/database.js';
import { generateKeywords } from '../services/llmService.js';

export const searchKeywordController = async (req, res) => {
  try {
    const { keywords = [], minExpYears, maxExpYears, location, preferredLocation, noticePeriod, expectedSalary, boolean } = req.body;

    const employerId = req.user.id;
    const companyId = req.user.company_id;

    const mainKeyword = keywords[0] || null;
    let query = `
  SELECT 
    users.id AS user_id,
    users.full_name,
    users.email,
    ANY_VALUE(user_profiles.profile_title) AS profile_title,
    ANY_VALUE(user_profiles.about_me) AS about_me,
    ANY_VALUE(user_profiles.current_location) AS current_location,
    ANY_VALUE(user_profiles.preferred_location) AS preferred_location,
    ANY_VALUE(user_profiles.total_experience_years) AS total_experience_years,
    ANY_VALUE(user_profiles.total_experience_months) AS total_experience_months,
    ANY_VALUE(user_profiles.expected_salary) AS expected_salary,
    ANY_VALUE(user_profiles.notice_period) AS notice_period,
    GROUP_CONCAT(DISTINCT user_skills.skill_name) AS skills,
    ANY_VALUE(job_applications.applied_at) AS applied_at,    
    ANY_VALUE(job_applications.hotvacancy_job_id) AS hotvacancy_job_id,
    ANY_VALUE(job_applications.internship_job_id) AS internship_job_id

  FROM users
  JOIN job_applications ON users.id = job_applications.user_id
  LEFT JOIN user_profiles ON users.id = user_profiles.user_id
  LEFT JOIN user_skills ON users.id = user_skills.user_id
  WHERE job_applications.company_id = ?
`;

    const params = [companyId];

    if (mainKeyword) {
      query += ` AND (user_profiles.profile_title LIKE ? OR user_skills.skill_name LIKE ?)`;
      params.push(`%${mainKeyword}%`, `%${mainKeyword}%`);
    }

    if (location) {
      query += ` AND user_profiles.current_location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (preferredLocation) {
      query += ` AND user_profiles.preferred_location LIKE ?`;
      params.push(`%${preferredLocation}%`);
    }

    if (minExpYears) {
      query += ` AND user_profiles.total_experience_years >= ?`;
      params.push(minExpYears);
    }

    if (maxExpYears) {
      query += ` AND user_profiles.total_experience_years <= ?`;
      params.push(maxExpYears);
    }

    if (expectedSalary) {
      query += ` AND user_profiles.expected_salary <= ?`;
      params.push(expectedSalary);
    }

    if (noticePeriod) {
      query += ` AND user_profiles.notice_period <= ?`;
      params.push(noticePeriod);
    }

    query += ` GROUP BY users.id LIMIT 50`;

    const [resumes] = await getReadPool().execute(query, params);
    console.log('resumes', resumes);

    return res.json({
      success: true,
      total: resumes.length,
      applicants: resumes,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
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

export const suggestionController = async (req, res) => {
  try {
    const { keyword } = req.query;
    console.log("inside suggestions:", keyword);
    

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
