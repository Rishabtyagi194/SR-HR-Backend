// models/auditLog.model.js
import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId }, // admin or system
    actorType: { type: String, enum: ['superadmin', 'system'], default: 'superadmin' },
    action: { type: String, required: true }, // e.g., "suspend_company", "create_plan"
    targetCollection: { type: String },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object }, // before/after snapshots
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true },
);

AuditLogSchema.index({ actorId: 1, action: 1, createdAt: -1 });

const auditLogModel = mongoose.model('AuditLog', AuditLogSchema);
export default auditLogModel;
