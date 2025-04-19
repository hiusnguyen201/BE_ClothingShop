'use strict';
import Database from '#src/modules/database/init.database';
import LogUtils from '#src/utils/log.util';
import { insertUsersService } from '#src/app/users/users.service';
import { saveListPermissionsService } from '#src/app/permissions/permissions.service';
import { insertRolesService } from '#src/app/roles/roles.service';
import { insertOptionsService, insertOptionValuesService } from '#src/app/options/options.service';
import { insertCategoriesService } from '#src/app/categories/categories.service';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { permissions } from '#src/database/data/permissions-data';
import { options, optionValues } from '#src/database/data/options-data';
import { categories } from '#src/database/data/categories-data';
import { roles } from '#src/database/data/roles-data';
import { users } from '#src/database/data/users-data';

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

Database.getInstance({ type: 'mongodb', logging: false });

async function runSeed() {
  LogUtils.info('SEED_DATABASE', 'Start seed database');

  await TransactionalServiceWrapper.execute(async (session) => {
    // Permissions
    LogUtils.info('PERMISSION', 'Start insert permissions');
    await saveListPermissionsService(permissions, session);
    LogUtils.success('PERMISSION', 'Insert permissions done');

    // Roles
    LogUtils.info('ROLE', 'Start insert roles');
    await insertRolesService(roles, session);
    LogUtils.success('ROLE', 'Insert roles done');

    // Users
    LogUtils.info('USER', 'Start insert users');
    await insertUsersService(users, session);
    LogUtils.success('USER', 'Insert users done');

    // Option Values
    LogUtils.info('OPTION_VALUE', 'Start insert option values');
    await insertOptionValuesService(optionValues, session);
    LogUtils.success('OPTION_VALUE', 'Insert option values done');

    // Options
    LogUtils.info('OPTION', 'Start insert options');
    await insertOptionsService(options, session);
    LogUtils.success('OPTION', 'Insert options done');

    // Categories
    LogUtils.info('CATEGORY', 'Start insert categories');
    await insertCategoriesService(categories, session);
    LogUtils.success('CATEGORY', 'Insert categories done');
  });

  LogUtils.info('SEED_DATABASE', 'Seed database successful');

  await Database.clear();

  process.exit(0);
}

runSeed();
