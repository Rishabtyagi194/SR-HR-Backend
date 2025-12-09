// src/index.js
import './config/config.js';
import app from './app.js';
import db, { initializeDatabase } from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Starting server...');
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log('Server started successfully!');
      console.log(`Server is listening at: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database: ${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
