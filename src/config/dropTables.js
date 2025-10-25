import { getWritePool } from './database.js';

export const dropAllTables = async () => {
  try {
    const connection = await getWritePool().getConnection();

    // Disable foreign key checks to drop tables safely
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop tables in reverse order of dependencies
    const tables = [
      'employer_users',
      'companies',
      'admins',
      'plan_options',
      'subscription_categories',
      'HotVacancyJobs',
      'users',
      'user_profiles',
      'user_education',
      'user_experience',
      'user_skills',
      'user_applications',
      'user_logs',
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

    console.log(`✅ Dropped table: ${tableName}`);
  } catch (error) {
    console.error(`❌ Error dropping table ${tableName}:`, error);
    throw error;
  }
};
