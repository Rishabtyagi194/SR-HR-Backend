import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_DB_URI = process.env.MONGO_DB_URI;

connectDB(MONGO_DB_URI);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
