import { backupAuditLogsByDateRangeService } from '#src/app/audit-logs/audit-log.service';
import LogUtils from '#src/utils/log.util';
import cron from 'node-cron';
import moment from 'moment-timezone';
moment.tz('Asia/Ho_Chi_Minh');

/**
    # ┌────────────── second (optional)
    # │ ┌──────────── minute
    # │ │ ┌────────── hour
    # │ │ │ ┌──────── day of month
    # │ │ │ │ ┌────── month
    # │ │ │ │ │ ┌──── day of week
    # │ │ │ │ │ │
    # │ │ │ │ │ │
    # * * * * * *
 */

// 0 0 2 * * * => 2 AM of daily
// */5 * * * * * => after 5s
cron.schedule('0 0 2 * * *', async () => {
  LogUtils.info('BACKUP_LOGS', 'Running daily audit log backup at 2:00 AM');
  try {
    const endTime = moment().startOf('day').add(2, 'hours');
    const startTime = endTime.clone().subtract(1, 'day');
    await backupAuditLogsByDateRangeService(startTime.toDate(), endTime.toDate());
    LogUtils.info(
      'BACKUP_LOGS',
      `Successfully backed up logs from ${startTime.toISOString()} to ${endTime.toISOString()}`,
    );
  } catch (err) {
    LogUtils.error('BACKUP_LOGS', 'Backup failed: ', err);
  }
});
