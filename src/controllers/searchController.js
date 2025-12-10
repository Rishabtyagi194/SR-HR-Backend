import { saveKeyword, getKeywordSuggestions } from '../services/redisService.js';
import { generateText } from '../services/ollamaService.js';
import { getReadPool } from '../config/database.js';

export const searchKeywordController = async (req, res) => {
  try {
    const {
      keywords = [],
      minExpYears,
      maxExpYears,
      location,
      preferredLocation,
      noticePeriod,
      expectedSalary,
      boolean
    } = req.body;

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
    console.log("resumes", resumes );

    return res.json({
      success: true,
      total: resumes.length,
      applicants: resumes,
    });

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const suggestionController = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.json({ suggestions: [] });

    const redisSuggestions = await getKeywordSuggestions(keyword);

    if (redisSuggestions.length >= 5) {
      return res.json({ suggestions: redisSuggestions.slice(0, 10) });
    }

    const [dbRows] = await getReadPool().execute(
      `SELECT keyword FROM search_keywords_history WHERE keyword LIKE ? LIMIT 10`,
      [`${keyword.toLowerCase()}%`]
    );
    const dbSuggestions = dbRows.map((r) => r.keyword);

    if (redisSuggestions.length + dbSuggestions.length >= 5) {
      return res.json({
        suggestions: [...new Set([...redisSuggestions, ...dbSuggestions])].slice(0, 10),
      });
    }

    let aiSuggestions = [];
    if (keyword.length > 3) {
    const prompt = `
      Generate only related job keywords for: "${keyword}".
      Return ONLY a comma-separated list with no sentences, no explanations, no quotes, no new lines.
      Example output: software engineer, backend developer, react developer, java, programming
    `;

      const aiResult = await generateText(prompt);

      if (aiResult && typeof aiResult === "string" && aiResult.includes(",")) {
        aiSuggestions = aiResult.split(",").map((v) => v.trim()).filter(Boolean);
      }
    }

    const finalSuggestions = [...new Set([...redisSuggestions, ...dbSuggestions, ...aiSuggestions])];

    return res.json({ suggestions: finalSuggestions.slice(0, 10) });
  } catch (err) {
    console.error("Suggestion error:", err);
    res.json({ suggestions: [] });
  }
};


// export const searchKeywordController = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     const employerId = req.user.id;
//     const companyId = req.user.company_id;

//     if (!keyword) return res.status(400).json({ message: 'Keyword required' });

//     await saveKeyword(keyword);

//     const redisSuggestions = await getKeywordSuggestions(keyword);

//     const aiResult = await generateText(` ${keyword}`);

//     const parsedAi = aiResult
//       .replace(/\*/g, '')
//       .replace(/\n/g, '')
//       .split(',')
//       .map((v) => v.trim())
//       .filter(Boolean);

//     const mainKeyword = parsedAi[0] || keyword;

//     const [resumes] = await getReadPool().execute(
//       `
//       SELECT 
//         users.id AS user_id,
//         users.full_name,
//         users.email,
//         ANY_VALUE(user_profiles.profile_title) AS profile_title,
//         ANY_VALUE(user_profiles.about_me) AS about_me,
//         GROUP_CONCAT(DISTINCT user_skills.skill_name) AS skills
//       FROM users
//       JOIN job_applications ON users.id = job_applications.user_id
//       LEFT JOIN user_profiles ON users.id = user_profiles.user_id
//       LEFT JOIN user_skills ON users.id = user_skills.user_id
//       LEFT JOIN user_experience ON users.id = user_experience.user_id
//       WHERE 
//         job_applications.company_id = ? AND (
//           user_profiles.profile_title LIKE ? OR
//           user_profiles.about_me LIKE ? OR
//           user_experience.job_title LIKE ? OR
//           user_experience.description LIKE ? OR
//           user_skills.skill_name LIKE ?
//         )
//       GROUP BY users.id
//       LIMIT 50
//       `,
//       [companyId, ...Array(5).fill(`%${mainKeyword}%`)],
//     );

//     console.log('resume', resumes);

//     return res.json({
//       entered: keyword,
//       aiSuggestions: parsedAi,
//       redisSuggestions,
//       searchKeywordUsed: mainKeyword,
//       resumes,
//     });
//   } catch (err) {
//     console.error('Search error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


// *******************************************************************************************************************

// export const suggestionController = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     if (!keyword) return res.json({ suggestions: [] });

//     // Redis first
//     const redisSuggestions = await getKeywordSuggestions(keyword);

//     // AI suggestions only when length > 3
//     let aiSuggestions = [];
  //   if (keyword.length > 3) {
  //     const aiResult = await generateText(
  //       `Generate only related job keywords for: "${keyword}".
  //  Return ONLY a comma-separated list with no sentences, no explanations, no quotes, no new lines.
  //  Example output: software engineer, backend developer, react developer, java, programming`,
  //     );

  //     aiSuggestions = aiResult
  //       ?.replace(/(\r\n|\n|\r)/gm, '')
  //       ?.replace(/[^a-zA-Z0-9, ]/g, '')
  //       ?.split(',')
  //       ?.map((v) => v.trim())
  //       ?.filter(Boolean)
  //       .slice(0, 8);
  //   }

//     return res.json({
//       suggestions: [...new Set([...redisSuggestions, ...aiSuggestions])].slice(0, 10),
//     });
//   } catch (err) {
//     console.log('Suggestion error:', err.message);
//     res.json({ suggestions: [] });
//   }
// };

// export const suggestionController = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     if (!keyword) return res.json({ suggestions: [] });

//     // Redis suggestions
//     const redisSuggestions = await getKeywordSuggestions(keyword);

//     // If redis has enough suggestions, return immediately (very fast)
//     if (redisSuggestions.length >= 5) {
//       return res.json({ suggestions: redisSuggestions.slice(0, 10) });
//     }

//     //  DB suggestions (prefix match)
//     const [dbRows] = await getReadPool().execute(`SELECT keyword FROM search_keywords_history WHERE keyword LIKE ? LIMIT 10`, [
//       `${keyword.toLowerCase()}%`,
//     ]);
//     const dbSuggestions = dbRows.map((r) => r.keyword);

//     // If redis + db enough, return (no AI call)
//     if (redisSuggestions.length + dbSuggestions.length >= 5) {
//       return res.json({
//         suggestions: [...new Set([...redisSuggestions, ...dbSuggestions])].slice(0, 10),
//       });
//     }

//     // AI suggestions only if prefix length > 3 and very few suggestions
//     let aiSuggestions = [];
//     if (keyword.length > 3) {
//       const aiResult = await generateText(`
//       Generate related job keywords for: "${keyword}".
//       Return ONLY 8 comma separated keywords. No sentences. No quotes.
//       `);

//       aiSuggestions = aiResult
//         .split(',')
//         .map((v) => v.trim())
//         .filter(Boolean);
//     }

//     // merge and store back into redis for future
//     const finalSuggestions = [...new Set([...redisSuggestions, ...dbSuggestions, ...aiSuggestions])];

//     // store AI suggestions into redis for future fast access
//     // for (const s of finalSuggestions) {
//     //   await saveKeyword(s);
//     // }

//     return res.json({ suggestions: finalSuggestions.slice(0, 10) });
//   } catch (err) {
//     console.error('Suggestion error:', err.message);
//     res.json({ suggestions: [] });
//   }
// };

// export const searchKeywordController = async (req, res) => {
//   try {
//     const { keyword } = req.query;

//     if (!keyword) return res.status(400).json({ message: 'Keyword required' });

//     // Save searched keyword in Redis history
//     await saveKeyword(keyword);

//     // Redis autocomplete suggestions
//     const redisSuggestions = await getKeywordSuggestions(keyword);

//     // Ollama AI result
//     const aiResult = await generateText(
//       `Correct spelling and suggest related job keywords for: ${keyword}.
//        Return only comma separated values.`,
//     );

//     const parsedAi = aiResult
//       .replace(/\*/g, '')
//       .replace(/\n/g, '')
//       .split(',')
//       .map((v) => v.trim())
//       .filter(Boolean);

//     const mainKeyword = parsedAi[0] || keyword;

//     // MySQL Resume search
//     const [resumes] = await getReadPool().execute('SELECT id, name, skills FROM resumes WHERE skills LIKE ? LIMIT 20', [
//       `%${mainKeyword}%`,
//     ]);

//     return res.json({
//       entered: keyword,
//       aiSuggestions: parsedAi,
//       redisSuggestions,
//       searchKeywordUsed: mainKeyword,
//       resumes,
//     });
//   } catch (err) {
//     console.error('Search error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
