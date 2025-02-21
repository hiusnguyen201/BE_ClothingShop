'use strict';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { startSession } from 'mongoose';
import { USER_TYPES } from '#core/constant';
import { makeSlug } from '#utils/string.util';
import { insertPermissionsService } from '#app/permissions/permissions.service';
import { insertRolesService } from '#app/roles/roles.service';
import { insertUsersService } from '#app/users/users.service';
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
      const result = await insertPermissionsService(
        PERMISSIONS_LIST.map((item) => ({ ...item, isActive: true, slug: makeSlug(item.name) })),
        { session },
      );

      // Role admin
      const roles = await insertRolesService(
        {
          name: 'Admin',
          isActive: true,
          slug: makeSlug('Admin'),
          permissions: result.map((item) => item._id),
        },
        { session },
      );

      // Admin account
      await insertUsersService(
        {
          name: 'Admin 123',
          email: 'admin123@gmail.com',
          password: '1234',
          isVerified: true,
          role: roles[0]._id,
          type: USER_TYPES.USER,
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
