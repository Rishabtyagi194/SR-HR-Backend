import './config.js';

import {
  // dropAllTables,
  dropSingleTable,
} from './dropTables.js';

const run = async () => {
  try {
    // await dropAllTables();

    // OR drop a single table:
    await dropSingleTable('jobs');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
