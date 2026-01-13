// src/models/Company.js
class Organisations {
  constructor({
    id,
    name,
    industry,
    size,
    website,
    logo_url,
    contact_email,
    contact_phone,
    address,
    verified,
    status,
    admin_user_id,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.name = name;
    this.industry = industry;
    this.size = size;
    this.website = website;
    this.logo_url = logo_url;
    this.contact_email = contact_email;
    this.contact_phone = contact_phone;
    this.address = address;
    this.verified = verified;
    this.status = status;
    this.admin_user_id = admin_user_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  validate() {
    if (!this.name || !this.contact_email) {
      throw new Error('Organisations name and contact email are required');
    }
    return true;
  }
}

export default Organisations;
