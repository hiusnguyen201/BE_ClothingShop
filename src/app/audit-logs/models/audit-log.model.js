import mongoose from 'mongoose';
const { Schema } = mongoose;

export const AUDIT_LOGS = 'audit_logs';

/**
 * This schema reference by microsoft
 * See also: {@link https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/auditlogs}
 */
const auditLogSchema = new Schema(
  {
    operationType: {
      type: String,
      enum: ['insert', 'update', 'delete'],
      required: true,
    },
    collection: {
      type: String,
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fullDocument: {
      type: String,
    },
    updateDescription: {
      type: String,
    },
    activityDate: {
      type: Date,
      default: Date.now(),
    },
    result: {
      type: String,
      enum: ['success', 'fail', 'unknown'],
      default: 'success',
    },
  },
  {
    versionKey: false,
    timestamps: true,
    id: false,
    _id: true,
    collection: AUDIT_LOGS,
  },
);

const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
export { AuditLogModel };
