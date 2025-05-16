import Database from '#src/modules/database/init.database';
import LogUtils from '#src/utils/log.util';
import { getPermissionsService, saveListPermissionsService } from '#src/app/permissions/permissions.repository';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { permissions } from '#src/database/data/permissions-data';

Database.getInstance({ type: 'mongodb', logging: false });

async function runSeed() {
  LogUtils.info('SEED_DATABASE', 'Start seed database');

  await TransactionalServiceWrapper.execute(async (session) => {
    // Permissions
    LogUtils.info('PERMISSION', 'Start insert permissions');
    const permissionList = await getPermissionsService({ name: { $in: permissions.map((item) => item.name) } });

    const permissionsToInsert = permissions.filter(
      (item) => permissionList.findIndex((p) => p.name === item.name) === -1,
    );
    await saveListPermissionsService(permissionsToInsert, session);
    LogUtils.success('PERMISSION', 'Insert permissions done');
  });

  LogUtils.info('SEED_DATABASE', 'Seed database successful');

  await Database.clear();

  process.exit(0);
}

runSeed();
