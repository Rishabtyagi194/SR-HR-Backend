// src/models/employerAndUser.model.js
class EmployerUser {
  constructor(row) {
    this.id = Number(row.id);
    this.company_id = Number(row.company_id);
    this.name = row.name;
    this.email = row.email;
    this.password = row.password;
    this.phone = row.phone;
    this.role = row.role;
    this.permissions = row.permissions ? JSON.parse(row.permissions) : null;
    this.isActive = row.is_active === 1;

    try {
      this.loginHistory = row.login_history ? JSON.parse(row.login_history) : [];
    } catch (err) {
      this.loginHistory = []; // fallback if JSON is invalid
    }
  }
}
export default EmployerUser;

// class EmployerUser {
//   constructor({
//     id,
//     company_id,
//     admin_id,
//     name,
//     email,
//     password,
//     phone,
//     role,
//     permissions,
//     is_active,
//     last_login,
//     login_history,
//     created_at,
//     updated_at,
//   }) {
//     this.id = Number(id);
//     this.company_id = company_id;
//     this.admin_id = admin_id;
//     this.name = name;
//     this.email = email;
//     this.password = password;
//     this.phone = phone;
//     this.role = role;
//     this.permissions = permissions ? JSON.parse(permissions) : ['all'];
//     this.isActive = !!is_active;
//     this.last_login = last_login;
//     this.loginHistory = login_history ? JSON.parse(login_history) : [];
//     this.created_at = created_at;
//     this.updated_at = updated_at;
//   }

//   validate() {
//     if (!this.name || !this.email || !this.password || !this.company_id) {
//       throw new Error('Name, email, password, and company ID are required');
//     }
//     return true;
//   }
// }

// export default EmployerUser;
