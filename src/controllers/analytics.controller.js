// controllers/analytics.controller.js
import paymentModel from '../models/payment.model.js';
import { getActiveSubscriptionsByPlan, getMonthlyRevenue } from '../services/analytics.service.js';

export const revenueReport = async (req, res) => {
  const { from, to } = req.query;
  const match = {
    status: 'succeeded',
    createdAt: {},
  };
  if (from) match.createdAt.$gte = new Date(from);
  if (to) match.createdAt.$lte = new Date(to);
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        totalCents: { $sum: '$amountCents' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ];
  const data = await paymentModel.aggregate(pipeline);
  return res.json({ data });
};

export const monthlyRevenue = async (req, res) => {
  try {
    const { start, end } = req.query; // pass dates as query params
    const data = await getMonthlyRevenue(new Date(start), new Date(end));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const activeSubscriptions = async (req, res) => {
  try {
    const data = await getActiveSubscriptionsByPlan();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
