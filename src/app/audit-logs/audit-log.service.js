import { getAuditLogsByDateRangeRepository } from '#src/app/audit-logs/audit-log.repository';
import { uploadFileBufferService, removeFileOnCloudService } from '#src/modules/cloudinary/cloudinary.service';
import path from 'path';
import fs from 'fs';
import moment from 'moment-timezone';
moment.tz('Asia/Ho_Chi_Minh');

export async function backupAuditLogsByDateRangeService(start, end) {
  const folderName = 'backup';
  const fileName = `audit-logs-${moment().valueOf()}.json`;
  const filePath = path.join(process.cwd(), folderName, fileName);

  try {
    //   Make sure file was created
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const logs = await getAuditLogsByDateRangeRepository(start, end);

    //   Write logs
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf8');

    //   Upload to cloud
    const buffer = fs.readFileSync(filePath);
    await uploadFileBufferService({ folderName, fileName, buffer });

    // Remove file in local
    fs.unlinkSync(filePath);
  } catch (err) {
    await removeFileOnCloudService({ folderName, fileName });
    throw err;
  }
}
