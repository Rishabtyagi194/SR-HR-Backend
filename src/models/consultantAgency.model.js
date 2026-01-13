class Consultant {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.industry = row.industry;
    this.contact_email = row.contact_email;
    this.contact_phone = row.contact_phone;
    this.address = row.address;
    this.verified = row.verified;
    this.status = row.status;
    this.created_at = row.created_at;
    this.updated_at = row.updated_at;
  }

  validate() {
    if (!this.name || !this.contact_email) {
      throw new Error('Consultant name and contact email are required');
    }
    return true;
  }
}

export default Consultant;
