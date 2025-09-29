// src/repositories/subscriptionRepository.js
import pool from '../config/database.js';
import SubscriptionCategory from '../models/SubscriptionCategory.model.js';

class SubscriptionRepository {
  async createCategory(categoryData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [categoryResult] = await connection.execute('INSERT INTO subscription_categories (name, slug, description) VALUES (?, ?, ?)', [
        categoryData.name,
        categoryData.slug,
        categoryData.description,
      ]);

      if (categoryData.plans && categoryData.plans.length > 0) {
        for (const plan of categoryData.plans) {
          await connection.execute(
            `INSERT INTO plan_options 
            (category_id, name, slug, price, currency, validity_days, job_location_limit, job_apply_limit, features, metadata) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              categoryResult.insertId,
              plan.name,
              plan.slug,
              plan.price,
              plan.currency || 'INR',
              plan.validityDays,
              plan.jobLocationLimit || 1,
              plan.jobApplyLimit || 0,
              JSON.stringify(plan.features || []),
              JSON.stringify(plan.metadata || {}),
            ],
          );
        }
      }

      await connection.commit();
      return this.findById(categoryResult.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findById(categoryId) {
    const [categories] = await pool.execute('SELECT * FROM subscription_categories WHERE id = ?', [categoryId]);

    if (categories.length === 0) return null;

    const [plans] = await pool.execute('SELECT * FROM plan_options WHERE category_id = ?', [categoryId]);

    return new SubscriptionCategory({
      ...categories[0],
      plans: plans.map((plan) => ({
        ...plan,
        features: JSON.parse(plan.features || '[]'),
        metadata: JSON.parse(plan.metadata || '{}'),
      })),
    });
  }

  async findBySlug(slug) {
    const [categories] = await pool.execute('SELECT * FROM subscription_categories WHERE slug = ?', [slug]);

    if (categories.length === 0) return null;

    const [plans] = await pool.execute('SELECT * FROM plan_options WHERE category_id = ?', [categories[0].id]);

    return new SubscriptionCategory({
      ...categories[0],
      plans: plans.map((plan) => ({
        ...plan,
        features: JSON.parse(plan.features || '[]'),
        metadata: JSON.parse(plan.metadata || '{}'),
      })),
    });
  }
}

export default new SubscriptionRepository();
