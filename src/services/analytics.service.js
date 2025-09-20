import Payment from '../models/payment.model.js';
import Subscription from '../models/subscription.model.js';

export async function getMonthlyRevenue(startDate, endDate) {
  return await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        totalCents: { $sum: '$amountCents' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
}

export async function getActiveSubscriptionsByPlan() {
  return await Subscription.aggregate([
    { $match: { status: 'active' } },
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'plan',
      },
    },
    { $unwind: '$plan' },
    { $group: { _id: '$plan.slug', activeCount: { $sum: 1 } } },
  ]);
}
