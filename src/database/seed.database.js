import Database from '#src/modules/database/init.database';
import LogUtils from '#src/utils/log.util';
import { saveListPermissionsRepository } from '#src/app/permissions/permissions.repository';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { permissions } from '#src/database/data/permissions-data';
import { insertRolesRepository } from '#src/app/roles/roles.repository';
import { roles } from '#src/database/data/roles-data';
import { insertUsersRepository } from '#src/app/users/users.repository';
import { customers, users } from '#src/database/data/users-data';
import { insertOptionsRepository, insertOptionValuesRepository } from '#src/app/options/options.repository';
import { options, optionValues } from '#src/database/data/options-data';
import { insertCategoriesRepository } from '#src/app/categories/categories.repository';
import { categories } from '#src/database/data/categories-data';
import { insertProductsRepository } from '#src/app/products/products.repository';
import { insertProductVariantsRepository } from '#src/app/product-variants/product-variants.repository';
import { products, variants } from '#src/database/data/products-data';
import { insertOrdersRepository } from '#src/app/orders/orders.repository';
import { orderDetails, orders, payments } from '#src/database/data/orders-data';
import { insertOrderDetailsRepository } from '#src/app/order-details/order-details.repository';
import { insertPaymentRepository } from '#src/app/payments/payments.repository';
import { insertCustomersRepository } from '#src/app/customers/customers.repository';

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

  try {
    // Permissions
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('PERMISSION', 'Start insert permissions');
      await saveListPermissionsRepository(permissions, session);
      LogUtils.success('PERMISSION', 'Insert permissions done');
    });

    // Roles
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('ROLE', 'Start insert roles');
      await insertRolesRepository(roles, session);
      LogUtils.success('ROLE', 'Insert roles done');
    });

    // Users
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('USER', 'Start insert users');
      await insertUsersRepository(users, session);
      LogUtils.success('USER', 'Insert users done');
    });

    // Customers
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('CUSTOMER', 'Start insert customers');
      await insertCustomersRepository(customers, session);
      LogUtils.success('CUSTOMER', 'Insert customers done');
    });

    // Option Values
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('OPTION_VALUE', 'Start insert option values');
      await insertOptionValuesRepository(optionValues, session);
      LogUtils.success('OPTION_VALUE', 'Insert option values done');
    });

    // Options
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('OPTION', 'Start insert options');
      await insertOptionsRepository(options, session);
      LogUtils.success('OPTION', 'Insert options done');
    });

    // Categories
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('CATEGORY', 'Start insert categories');
      await insertCategoriesRepository(categories, session);
      LogUtils.success('CATEGORY', 'Insert categories done');
    });

    // Products
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('PRODUCT', 'Start insert products');
      await insertProductsRepository(products, session);
      LogUtils.success('PRODUCT', 'Insert products done');
    });

    // Product Variants
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('PRODUCT_VARIANT', 'Start insert product variants');
      await insertProductVariantsRepository(variants, session);
      LogUtils.success('PRODUCT_VARIANT', 'Insert product variants done');
    });

    // Order
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('ORDER', 'Start insert order');
      await insertOrdersRepository(orders, session);
      LogUtils.success('ORDER', 'Insert order done');
    });

    // Order Detail
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('ORDER_DETAILS', 'Start insert order detail');
      await insertOrderDetailsRepository(orderDetails, session);
      LogUtils.success('ORDER_DETAILS', 'Insert order detail done');
    });

    // Payment
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('PAYMENT', 'Start insert payment');
      await insertPaymentRepository(payments, session);
      LogUtils.success('PAYMENT', 'Insert payment done');
    });
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
  }

  LogUtils.info('SEED_DATABASE', 'Seed database successful');

  await Database.clear();

  process.exit(0);
}

runSeed();
