// src/services/subscriptionService.js
import subscriptionRepository from '../queries/subscriptionQueries.js';

class SubscriptionService {
  async createCategory(categoryData) {
    const existingCategory = await subscriptionRepository.findBySlug(categoryData.slug);
    if (existingCategory) {
      throw new Error('Slug already exists');
    }

    return await subscriptionRepository.createCategory(categoryData);
  }
}

export default new SubscriptionService();
