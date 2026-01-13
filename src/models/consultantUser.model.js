class ConsultantUser {
  constructor(row) {
    this.id = row.id;
    this.organisation_id = row.organisation_id;
    this.name = row.name;
    this.email = row.email;
    this.password = row.password; 
    this.phone = row.phone;
    this.role = row.role;
    this.is_owner = row.is_owner;
    this.is_active = row.is_active;
  }
}

export default ConsultantUser;
