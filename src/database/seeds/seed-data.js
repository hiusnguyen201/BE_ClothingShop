'use strict';
import { USER_TYPE } from '#src/app/users/users.constant';
import { getOrCreateListPermissionService } from '#src/app/permissions/permissions.service';
import { getOrCreateRoleService } from '#src/app/roles/roles.service';
import { getOrCreateUserService } from '#src/app/users/users.service';
import { PERMISSIONS_LIST } from '#src/database/seeds/permissions-data';
import Database from '#src/modules/database/init.database';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { PERMISSION_MODEL } from '#src/app/permissions/models/permission.model';
import { ROLE_MODEL } from '#src/app/roles/models/role.model';
import { USER_MODEL } from '#src/app/users/models/user.model';
import { OPTIONS_MODEL } from '#src/app/options/models/option.model';
import { OPTIONS_DATA } from '#src/database/seeds/options-data';
import { OPTION_VALUES_MODEL } from '#src/app/option-values/models/option-value.model';
import { getOrCreateOptionValuesService } from '#src/app/option-values/option-values.service';
import { getOrCreateOptionService } from '#src/app/options/options.service';

/**
 * Need fix MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
 * - Stop mongodb service
 *
 * - Add the replication in file mongod.conf:
 * replication:
 *  replSetName: "rs0"
 *
 * - Start mongodb service
 *
 * - Run rs.initiate() in mongo shell
 * - Check replica set is configured: rs.status()
 */

Database.getInstance({ type: 'mongodb', logging: process.env.NODE_ENV === 'development' });

const models = [PERMISSION_MODEL, ROLE_MODEL, USER_MODEL, OPTIONS_MODEL, OPTION_VALUES_MODEL];

async function runSeed() {
  await TransactionalServiceWrapper.execute(async (session) => {
    /**
     * Init tables
     */
    const collections = await Promise.all([
      Database.instance.connection.db.listCollections({
        name: { $in: models },
      }),
    ]);

    const existingCollections = new Set(collections.map((col) => col.name));

    await Promise.all(
      models
        .filter((model) => !existingCollections.has(model))
        .map((model) => Database.instance.connection.createCollection(model)),
    );

    /**
     * RBAC
     */
    const permissions = await getOrCreateListPermissionService(PERMISSIONS_LIST, session);
    const role = await getOrCreateRoleService(
      {
        name: 'Access Control Manager',
        description: 'Responsibilities include managing role-based access control (RBAC)',
        permissions: permissions.map((p) => p._id),
      },
      session,
    );
    await getOrCreateUserService(
      {
        name: 'Admin 123',
        email: 'admin123@gmail.com',
        password: '1234',
        phone: '0383460015',
        verifiedAt: new Date(),
        role: role._id,
        type: USER_TYPE.USER,
      },
      session,
    );

    /**
     * Options & Option value
     */
    await Promise.all(
      OPTIONS_DATA.map(async (option) => {
        const optionValuesData = option.values.map((value) => ({ valueName: value }));
        const optionValues = await getOrCreateOptionValuesService(optionValuesData, session);
        await getOrCreateOptionService({
          name: option.name,
          optionValues: optionValues.map((item) => item._id),
        });
      }),
    );
  });
}

await runSeed();
await Database.close();
