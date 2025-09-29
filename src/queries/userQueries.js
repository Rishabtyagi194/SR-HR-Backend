import db from '../config/database.js';

class UserRepository {
  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async create(userData) {
    const { name, email, password } = userData;
    const [result] = await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    return this.findById(result.insertId);
  }

  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }
}

export default new UserRepository();
