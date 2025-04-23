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
import { products, variants } from '#src/database/data/products-data';
import { insertProductsService } from '#src/app/products/products.service';
import { insertProductVariantsService } from '#src/app/product-variants/product-variants.service';
import { insertOrdersService } from '#src/app/orders/orders.service';
import { orderDetails, orders, payments } from '#src/database/data/orders-data';
import { insertOrderDetailsService } from '#src/app/order-details/order-details.service';
import { insertPaymentService } from '#src/app/payments/payments.service';
import { retryBulkWrite } from '#src/utils/bulk.util';

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
      await retryBulkWrite(async () => {
        await saveListPermissionsService(permissions, session);
      });
      LogUtils.success('PERMISSION', 'Insert permissions done');
    });

    // Roles
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('ROLE', 'Start insert roles');
      await retryBulkWrite(async () => {
        await insertRolesService(roles, session);
      });
      LogUtils.success('ROLE', 'Insert roles done');
    });

    // Users
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('USER', 'Start insert users');
      await retryBulkWrite(async () => {
        await insertUsersService(users, session);
      });
      LogUtils.success('USER', 'Insert users done');
    });

    // Option Values
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('OPTION_VALUE', 'Start insert option values');
      await retryBulkWrite(async () => {
        await insertOptionValuesService(optionValues, session);
      });
      LogUtils.success('OPTION_VALUE', 'Insert option values done');
    });

    // Options
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('OPTION', 'Start insert options');
      await retryBulkWrite(async () => {
        await insertOptionsService(options, session);
      });
      LogUtils.success('OPTION', 'Insert options done');
    });

    // Categories
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('CATEGORY', 'Start insert categories');
      await retryBulkWrite(async () => {
        await insertCategoriesService(categories, session);
      });
      LogUtils.success('CATEGORY', 'Insert categories done');
    });

    // Products
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('PRODUCT', 'Start insert products');
      await retryBulkWrite(async () => {
        await insertProductsService(products, session);
      });
      LogUtils.success('PRODUCT', 'Insert products done');
    });

    // Product Variants
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('PRODUCT_VARIANT', 'Start insert product variants');
      await retryBulkWrite(async () => {
        await insertProductVariantsService(variants, session);
      });
      LogUtils.success('PRODUCT_VARIANT', 'Insert product variants done');
    });

    // Order
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('ORDER', 'Start insert order');
      await retryBulkWrite(async () => {
        await insertOrdersService(orders, session);
      });
      LogUtils.success('ORDER', 'Insert order done');
    });

    // Order Detail
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('ORDER_DETAILS', 'Start insert order detail');
      await retryBulkWrite(async () => {
        await insertOrderDetailsService(orderDetails, session);
      });
      LogUtils.success('ORDER_DETAILS', 'Insert order detail done');
    });

    // Payment
    await TransactionalServiceWrapper.execute(async (session) => {
      LogUtils.info('PAYMENT', 'Start insert payment');
      await retryBulkWrite(async () => {
        await insertPaymentService(payments, session);
      });
      LogUtils.success('PAYMENT', 'Insert payment done');
    });
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
  }

  LogUtils.info('SEED_DATABASE', 'Seed database successful');

  await Database.clear();
}

runSeed();
