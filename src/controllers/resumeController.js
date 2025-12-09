import fs from 'fs';
import { createRequire } from 'module';
import OpenAI from 'openai';
import { getReadPool, getWritePool } from '../config/database.js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse'); // ← works with 1.1.1

// console.log('pdf-parse loaded correctly:', typeof pdf);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const uploadResumeController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Extract text from PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // System prompt for GPT-4o-mini
    const systemPrompt = `
      You are a professional resume parser. 
      Extract all relevant structured data from the resume text and return JSON in this exact schema:

      {
        "name": "string",
        "email": "string",
        "phone": "string",
        "skills": ["string"],
        "education": [
          { "degree": "string", "institution": "string", "year": "string" }
        ],
        "experience": [
          { "company": "string", "position": "string", "duration": "string", "description": "string" }
        ]
      }

      Only include relevant professional details. 
      If a field is not found, leave it as an empty array or null.
      `;

    // Ask OpenAI to parse
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;

    // Ensure response is valid JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error(' Failed to parse OpenAI response:', content);
      return res.status(500).json({
        success: false,
        message: 'AI parsing failed. Invalid JSON response from OpenAI.',
      });
    }

    const { name, email, phone, skills, education, experience } = parsed;

    //  Basic validation
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Resume must contain a valid email and phone number.',
      });
    }

    //  Check for duplicate
    const [existing] = await getReadPool().execute('SELECT id FROM resumes WHERE email = ? OR phone = ?', [email, phone]);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate resume detected (same email or phone already exists).',
      });
    }

    // Insert main resume record
    const [result] = await getWritePool().execute(
      `INSERT INTO resumes (name, email, phone, file_path)
       VALUES (?, ?, ?, ?)`,
      [name, email, phone, req.file.path],
    );

    const resumeId = result.insertId;

    // Insert skills
    if (skills?.length) {
      const skillValues = skills.map((s) => [resumeId, s]);
      await getWritePool().query('INSERT INTO resume_skills (resume_id, skill_name) VALUES ?', [skillValues]);
    }

    // Insert education
    if (education?.length) {
      const eduValues = education.map((e) => [resumeId, e.degree || null, e.institution || null, e.year || null]);
      await getWritePool().query('INSERT INTO resume_education (resume_id, degree, institution, year) VALUES ?', [eduValues]);
    }

    //  Insert experience
    if (experience?.length) {
      const expValues = experience.map((ex) => [
        resumeId,
        ex.company || null,
        ex.position || null,
        ex.duration || null,
        ex.description || null,
      ]);
      await getWritePool().query('INSERT INTO resume_experience (resume_id, company, position, duration, description) VALUES ?', [
        expValues,
      ]);
    }

    //  Final response
    return res.status(200).json({
      success: true,
      message: 'Resume parsed and stored successfully',
      data: parsed,
    });
  } catch (error) {
    console.error('Resume parse error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing resume',
      error: error.message,
    });
  }
};

// export const uploadResumeController1 = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//     const dataBuffer = fs.readFileSync(req.file.path);
//     const data = await pdf(dataBuffer);
//     const text = data.text;

//     // --- Basic extraction using regex ---
//     const nameMatch = text.match(/Name[:\s]+([A-Za-z\s]+)/i);
//     const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
//     const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?\d{10})/);
//     const skillsMatch = text.match(/Skills[:\s]+([\s\S]*?)(Education|Experience|$)/i);
//     const educationMatch = text.match(/Education[:\s]+([\s\S]*?)(Experience|Skills|$)/i);
//     const experienceMatch = text.match(/Experience[:\s]+([\s\S]*)/i);

//     const resumeData = {
//       name: nameMatch ? nameMatch[1].trim() : null,
//       email: emailMatch ? emailMatch[0] : null,
//       phone: phoneMatch ? phoneMatch[0] : null,
//       skills: skillsMatch ? skillsMatch[1].trim() : null,
//       education: educationMatch ? educationMatch[1].trim() : null,
//       experience: experienceMatch ? experienceMatch[1].trim() : null,
//       file_path: req.file.path,
//     };

//     await getWritePool().execute(
//       `INSERT INTO resume (name, email, phone, skills, education, experience, file_path)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         resumeData.name,
//         resumeData.email,
//         resumeData.phone,
//         resumeData.skills,
//         resumeData.education,
//         resumeData.experience,
//         resumeData.file_path,
//       ],
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Resume parsed and saved successfully',
//       data: resumeData,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: 'Error processing resume',
//       error: err.message,
//     });
//   }
// };
