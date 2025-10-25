import './config.js';

import {
<<<<<<< HEAD
  dropAllTables,
  // dropSingleTable,
=======
  // dropAllTables,
  dropSingleTable,
>>>>>>> 25f851ac7d721537ea311ef8d52d1e578de77e08
} from './dropTables.js';

const run = async () => {
  try {
<<<<<<< HEAD
    await dropAllTables();

    // OR drop a single table:
    // await dropSingleTable('users');
=======
    // await dropAllTables();

    // OR drop a single table:
    await dropSingleTable('jobs');
>>>>>>> 25f851ac7d721537ea311ef8d52d1e578de77e08
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
