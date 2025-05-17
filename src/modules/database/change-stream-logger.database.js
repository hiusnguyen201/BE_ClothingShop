import { createAuditLogRepository } from '#src/app/audit-logs/audit-log.repository';
import { USER_OTP_MODEL } from '#src/app/auth/models/user-otp.model';
import { DiscordService } from '#src/modules/discord/discord.service';
import { AUDIT_LOGS } from '#src/app/audit-logs/models/audit-log.model';

export function startChangeStreamLogger(connection) {
  const changeStream = connection.db.watch(
    [
      {
        $match: {
          operationType: { $in: ['insert', 'update', 'delete'] },
          'ns.coll': { $nin: [USER_OTP_MODEL, AUDIT_LOGS] },
        },
      },
    ],
    {
      fullDocument: 'updateLookup',
    },
  );

  changeStream.on('change', async (change) => {
    try {
      await createAuditLogRepository({
        operationType: change.operationType,
        collection: change.ns.coll,
        documentId: change.documentKey._id,
        fullDocument: change.operationType === 'insert' ? JSON.stringify(change.fullDocument) : undefined,
        updateDescription: JSON.stringify(change.updateDescription),
        result: 'success',
      });
    } catch (err) {
      await DiscordService.sendError(err.message);
    }
  });
}
