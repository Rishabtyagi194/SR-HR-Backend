import './config.js';

import { dropAllTables } from './dropTables.js';

const run = async () => {
  try {
    await dropAllTables();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
