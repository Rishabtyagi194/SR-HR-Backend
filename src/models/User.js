// src/models/User.js
class User {
  constructor({ id, name, email, password, created_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.created_at = created_at;
  }

  // Add validation methods if needed
  validate() {
    if (!this.email || !this.password) {
      throw new Error('Email and password are required');
    }
    return true;
  }
}

export default User;
