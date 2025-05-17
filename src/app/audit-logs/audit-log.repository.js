import { AuditLogModel } from '#src/app/audit-logs/models/audit-log.model';

/**
 * Creates a new audit log entry
 * @param {Object} data - The audit log data
 * @param {string} data.operationType - Type of operation (insert/update/delete)
 * @param {string} data.collection - Collection name being modified
 * @param {string} data.documentId - ID of affected document
 * @param {Object} [data.fullDocument] - Complete document for insert operations
 * @param {Object} [data.updateDescription] - Changes for update operations
 * @param {Object} [data.initiatedBy] - User who performed the action
 * @param {string} [data.ipAddress] - IP address of request
 * @param {string} [data.userAgent] - Browser/client information
 * @param {string} [data.correlationId] - Request tracking ID
 * @param {string} [data.activityDate] - Activity date
 * @param {string} [data.result='success'] - Operation result status
 * @returns {Promise<void>}
 * @throws {Error} If insertion fails
 */
export async function createAuditLogRepository(data) {
  await AuditLogModel.create(data);
}

export async function getAuditLogsByDateRangeRepository(start, end) {
  return await AuditLogModel.find({ createdAt: { $gte: start, $lte: end } }).lean();
}

export async function clearAuditLogsRepository() {
  await AuditLogModel.deleteMany({});
}
