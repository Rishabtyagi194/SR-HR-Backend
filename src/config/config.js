import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const projectRoot = resolve(__dirname, '..', '..');
let branch = 'qa';

try {
  branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (err) {
  console.warn('Could not detect branch, defaulting to QA');
}

let envFile = resolve(projectRoot, '.env.qa');
if (branch === 'main') envFile = resolve(projectRoot, '.env.prod');

// console.log('Loading environment from:', envFile);
// console.log('Project root:', projectRoot);

const envConfig = dotenv.config({ path: envFile });
if (envConfig.error) {
  throw new Error(`Failed to load environment file: ${envConfig.error}`);
}

// Export the database configuration
export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Verify configuration is loaded
// console.log('Database Configuration:');
// console.log(`Host: ${dbConfig.host}`);
// console.log(`User: ${dbConfig.user}`);
// console.log(`Database: ${dbConfig.database}`);
// console.log(`Password: ${dbConfig.password ? '***' : 'NOT SET'}`);

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbConfig,
};
