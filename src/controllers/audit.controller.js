import auditLogModel from '../models/auditLog.model.js';

// GET /admin/audit-logs?actorId=&action=&from=&to=&page=&limit=
export const getAuditLogs = async (req, res) => {
  try {
    const { actorId, action, from, to, page = 1, limit = 20 } = req.query;

    const query = {};

    if (actorId) query.actorId = actorId;
    if (action) query.action = action;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, totalAuditLog] = await Promise.all([
      auditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      auditLogModel.countDocuments(query),
    ]);

    return res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      totalAuditLog,
      totalPages: Math.ceil(totalAuditLog / limit),
      data: logs,
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ msg: 'Error fetching audit logs', error: err.message });
  }
};
