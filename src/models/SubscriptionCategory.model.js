// src/models/SubscriptionCategory.js
class SubscriptionCategory {
  constructor({ id, name, slug, description, is_active, created_at, updated_at, plans }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.plans = plans || [];
  }

  validate() {
    if (!this.name || !this.slug) {
      throw new Error('Name and slug are required');
    }
    return true;
  }
}

export default SubscriptionCategory;
