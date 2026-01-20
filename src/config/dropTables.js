import { getWritePool } from './database.js';

export const dropAllTables = async () => {
  try {
    const connection = await getWritePool().getConnection();

    // Disable foreign key checks to drop tables safely
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop tables in reverse order of dependencies
    const tables = [
      // 'plan_options',
      // 'subscription_categories',
      // 'admins',
      // 'organisations',
      // 'employer_users',
      // 'HotVacancyJobs',
      // 'InternshipJobs',
      // 'users',
      // 'user_profiles',
      // 'user_education',
      // 'user_experience',
      // 'user_skills',
      // 'user_projects',
      // 'user_accomplishments',
      // 'user_social_profiles',
      // 'user_work_samples',
      // 'user_certifications',
      // 'user_applications',
      // 'Excel_data_uploads',
      // 'user_logs',
      // 'job_application_answers',
      // 'job_applications',
      // 'resumes',
      // 'resume_skills',
      // 'resume_education',
      // 'resume_experience',
      // 'saved_jobs',
      // 'search_keywords_history',
      // 'consultant_agencies',
      // 'consultant_users',
      // 'consultant_job_applications',
      // 'contactusLeads'
    ];

    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table: ${table}`);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    connection.release();
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};

/**
 * Drop a single table by name
 * @param {string} tableName - The name of the table to drop
 */
export const dropSingleTable = async (tableName) => {
  if (!tableName) throw new Error('Table name is required');

  try {
    const connection = await pool.getConnection();

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    connection.release();

    console.log(`Dropped table: ${tableName}`);
  } catch (error) {
    console.error(`Error dropping table ${tableName}:`, error);
    throw error;
  }
};
