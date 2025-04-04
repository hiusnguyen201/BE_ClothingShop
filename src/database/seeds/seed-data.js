'use strict';
import { GENDER, USER_TYPE } from '#src/app/users/users.constant';
import { getOrCreateListPermissionServiceWithTransaction } from '#src/app/permissions/permissions.service';
import { getOrCreateRoleServiceWithTransaction } from '#src/app/roles/roles.service';
import { getOrCreateUsersWithTransaction } from '#src/app/users/users.service';
import { PERMISSIONS_LIST } from '#src/database/seeds/permissions-data';
import Database from '#src/modules/database/init.database';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { PERMISSION_MODEL } from '#src/app/permissions/models/permission.model';
import { ROLE_MODEL } from '#src/app/roles/models/role.model';
import { USER_MODEL } from '#src/app/users/models/user.model';

Database.getInstance({ type: 'mongodb', logging: process.env.NODE_ENV === 'development' });
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

const models = [PERMISSION_MODEL, ROLE_MODEL, USER_MODEL];

async function runSeed() {
  await TransactionalServiceWrapper.execute(async (session) => {
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
     * Permission
     */
    const permissions = await getOrCreateListPermissionServiceWithTransaction(PERMISSIONS_LIST, session);

    /**
     * Role
     */
    const role = await getOrCreateRoleServiceWithTransaction(
      {
        name: 'Admin',
        description: 'This is admin',
        permissions: permissions.map((p) => p._id),
      },
      session,
    );

    /**
     * User
     */
    await getOrCreateUsersWithTransaction(
      [
        {
          name: 'Admin Verified',
          email: 'admin123@gmail.com',
          password: '1234',
          phone: '0383460015',
          verifiedAt: new Date(),
          role: role._id,
          gender: GENDER.MALE,
          type: USER_TYPE.USER,
        },
        {
          name: 'Admin Unverified',
          email: 'admin1234@gmail.com',
          password: '1234',
          phone: '0383460015',
          role: role._id,
          gender: GENDER.MALE,
          type: USER_TYPE.USER,
        },
        {
          name: 'Customer Verified',
          email: 'customer123@gmail.com',
          password: '1234',
          phone: '0383460015',
          verifiedAt: new Date(),
          gender: GENDER.MALE,
          type: USER_TYPE.CUSTOMER,
        },
        {
          name: 'Customer Unverified',
          email: 'customer1234@gmail.com',
          password: '1234',
          phone: '0383460015',
          gender: GENDER.MALE,
          type: USER_TYPE.CUSTOMER,
        },
      ],
      session,
    );
  });
}

await runSeed();
await Database.close();
