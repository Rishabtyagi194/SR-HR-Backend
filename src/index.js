import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { execSync } from 'child_process';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// make __dirname work in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Detect current git branch
let branch = 'qa';
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (err) {
  console.warn('Could not detect branch, defaulting to QA');
}

// 2. Select env file
let envFile = resolve(__dirname, '../.env.qa');
if (branch === 'main') envFile = resolve(__dirname, '../.env.prod');

//3. Load env file
dotenv.config({ path: envFile });

// 4. Read env vars
const PORT = process.env.PORT || 5000;
const MONGO_DB_URI = process.env.MONGO_DB_URI;

// 5. Connect DB
connectDB(MONGO_DB_URI);

// console.log(`Running on branch: ${branch}`);
// console.log(`Environment: ${process.env.NODE_ENV}`);
// console.log(`DB: ${process.env.MONGO_DB_URI}`);

app.get('/', (req, res) => {
  res.send(`Hello from ${process.env.NODE_ENV} environment`);
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
