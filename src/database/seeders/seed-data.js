'use strict';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { UserConstant } from '#app/v2/users/UserConstant';
import { getOrCreateListPermissionServiceWithTransaction } from '#src/app/v1/permissions/permissions.service';
import { getOrCreateRoleServiceWithTransaction } from '#src/app/v1/roles/roles.service';
import { getOrCreateUserWithTransaction } from '#src/app/v1/users/users.service';
import { PERMISSIONS_LIST } from '#database/seeders/permissions-data';
import Database from '#src/modules/database/init.database';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { PERMISSION_MODEL } from '#src/models/permission.model';
import { ROLE_MODEL } from '#src/models/role.model';
import { USER_MODEL } from '#src/models/user.model';

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
async function runSeeder() {
  await TransactionalServiceWrapper.execute(async (session) => {
    // Permission
    const permissionCollections = await Database.instance.connection.db
      .listCollections({ name: PERMISSION_MODEL })
      .toArray();
    if (permissionCollections.length === 0) {
      await Database.instance.connection.createCollection(PERMISSION_MODEL);
    }
    const permissions = await getOrCreateListPermissionServiceWithTransaction(PERMISSIONS_LIST, session);

    // Role
    const roleCollections = await Database.instance.connection.db.listCollections({ name: ROLE_MODEL }).toArray();
    if (roleCollections.length === 0) {
      await Database.instance.connection.createCollection(ROLE_MODEL);
    }
    const role = await getOrCreateRoleServiceWithTransaction(
      {
        name: 'Admin',
        isActive: true,
        permissions: permissions.map((p) => p._id),
      },
      session,
    );

    // User
    const userCollections = await Database.instance.connection.db.listCollections({ name: USER_MODEL }).toArray();
    if (userCollections.length === 0) {
      await Database.instance.connection.createCollection(USER_MODEL);
    }
    await getOrCreateUserWithTransaction(
      {
        name: 'Admin 123',
        email: 'admin123@gmail.com',
        password: '1234',
        phone: '0383460015',
        isVerified: true,
        verifiedAt: new Date(),
        role: role._id,
        type: UserConstant.USER_TYPES.USER,
      },
      session,
    );
  });
}

await runSeeder();
await Database.close();
