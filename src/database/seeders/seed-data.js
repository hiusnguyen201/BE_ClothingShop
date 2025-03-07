'use strict';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { startSession } from 'mongoose';
import { UserConstant } from '#app/v2/users/UserConstant';
import { makeSlug } from '#utils/string.util';
import { getOrCreatePermissionServiceWithTransaction } from '#src/app/v1/permissions/permissions.service';
import { getOrCreateRoleServiceWithTransaction } from '#src/app/v1/roles/roles.service';
import { getOrCreateUserWithTransaction } from '#src/app/v1/users/users.service';
import { PERMISSIONS_LIST } from '#database/seeders/permissions-data';
import Database from '#src/modules/mongodb/init.database';

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
  const session = await startSession();
  try {
    await session.withTransaction(async () => {
      // List permissions
      const permissionIds = await Promise.all(
        PERMISSIONS_LIST.map(async (item) => {
          const result = await getOrCreatePermissionServiceWithTransaction(item, session);
          return result._id;
        }),
      );

      // Role admin
      const role = await getOrCreateRoleServiceWithTransaction(
        {
          name: 'Admin',
          isActive: true,
          slug: makeSlug('Admin'),
          permissions: permissionIds,
        },
        { session },
      );

      // Admin account
      await getOrCreateUserWithTransaction(
        {
          name: 'Admin 123',
          email: 'admin123@gmail.com',
          password: '1234',
          isVerified: true,
          role: role._id,
          type: UserConstant.USER_TYPES.USER,
        },
        { session },
      );
    });
  } catch (err) {
    console.error('Transaction failed:', err.message);
  } finally {
    await session.endSession();
    await Database.close();
  }
}

runSeeder();
