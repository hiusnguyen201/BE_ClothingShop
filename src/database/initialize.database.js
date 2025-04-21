import Database from '#src/modules/database/init.database';
import { PERMISSION_MODEL } from '#src/app/permissions/models/permission.model';
import { ROLE_MODEL } from '#src/app/roles/models/role.model';
import { USER_MODEL } from '#src/app/users/models/user.model';
import { OPTIONS_MODEL } from '#src/app/options/models/option.model';
import { OPTION_VALUES_MODEL } from '#src/app/options/models/option-value.model';
import { CATEGORY_MODEL } from '#src/app/categories/models/category.model';
import { ORDER_DETAIL_MODEL } from '#src/app/order-details/models/order-details.model';
import { ORDER_STATUS_HISTORY_MODEL } from '#src/app/order-status-history/models/order-status-history.model';
import { ORDER_MODEL } from '#src/app/orders/models/orders.model';
import { PAYMENT_MODEL } from '#src/app/payments/models/payments.model';
import { PRODUCT_VARIANT_MODEL } from '#src/app/product-variants/models/product-variants.model';
import { PRODUCT_MODEL } from '#src/app/products/models/product.model';
import { SHIPPING_ADDRESS_MODEL } from '#src/app/shipping-address/models/shipping-address.model';
import LogUtils from '#src/utils/log.util';

const models = [
  PERMISSION_MODEL,
  ROLE_MODEL,
  USER_MODEL,
  OPTIONS_MODEL,
  OPTION_VALUES_MODEL,
  CATEGORY_MODEL,
  ORDER_DETAIL_MODEL,
  ORDER_STATUS_HISTORY_MODEL,
  ORDER_MODEL,
  PAYMENT_MODEL,
  PRODUCT_VARIANT_MODEL,
  PRODUCT_MODEL,
  SHIPPING_ADDRESS_MODEL,
];

async function initialize() {
  const instance = await Database.getInstance({ type: 'mongodb', logging: false });

  LogUtils.info('INITIALIZE_DATABASE', 'Start initialize database');

  const collections = await instance.connection.db.listCollections().toArray();
  const existingCollections = new Set(collections.map((col) => col.name));

  await Promise.all(
    models
      .filter((model) => !existingCollections.has(model))
      .map((model) => Database.instance.connection.createCollection(model)),
  );

  LogUtils.success('INITIALIZE_DATABASE', 'Initialize database successful');
  await Database.clear();

  process.exit(0);
}

initialize();
