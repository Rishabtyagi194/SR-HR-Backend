// src/models/superAdmin.model.js
class Admin {
  constructor({ id, name, email, phone, password, role, last_login, created_at, updated_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role;
    this.last_login = last_login;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  validate() {
    if (!this.email || !this.password || !this.name || !this.phone) {
      throw new Error('All fields are required');
    }
    if (this.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    return true;
  }
}

export default Admin;
