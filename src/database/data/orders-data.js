/** @type {import('#src/app/orders/models/orders.model')} */
/** @type {import('#src/app/order-details/models/order-details.model')} */
/** @type {import('#src/app/payments/models/payments.model')} */

import pkg from 'vietnam-provinces';
import { newOrderService } from '#src/app/orders/orders.service';
import { faker } from '@faker-js/faker';
import { ORDER_STATUS } from '#src/app/orders/orders.constant';
import { generateVietnamPhoneNumber, customers } from '#src/database/data/users-data';
import { variants } from '#src/database/data/products-data';
import { newOrderDetailService } from '#src/app/order-details/order-details.service';
import { newPaymentService } from '#src/app/payments/payments.service';
import { ONLINE_PAYMENT_METHOD, PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import { orderCodeGenerator } from '#src/utils/generator';
const { provinces, getDistricts, getWards } = pkg;

const ORDER_FLOWS = [
  // ✅ Full success flow
  [ORDER_STATUS.PENDING],
  [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED],
  [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING],
  [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.READY_TO_PICK],
  [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.READY_TO_PICK,
    ORDER_STATUS.SHIPPING,
  ],
  [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.READY_TO_PICK,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.COMPLETED,
  ],

  // ❌ Cancelled early
  [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],

  // ❌ Cancelled after confirmed
  [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],

  // ❌ Cancelled during processing
  [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],

  // ❌ Cancelled at ready-to-pick
  [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.READY_TO_PICK,
    ORDER_STATUS.CANCELLED,
  ],
];

const PAYMENT_FLOWS = [
  { flow: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID], forceOrder: null },
  { flow: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID, PAYMENT_STATUS.REFUND], forceOrder: ORDER_STATUS.CANCELLED },
  { flow: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.CANCELLED], forceOrder: ORDER_STATUS.CANCELLED },
];

function weightedRandomFlow(forceFinalStatus = null) {
  const successFlows = ORDER_FLOWS.filter((f) => f.at(-1) !== ORDER_STATUS.CANCELLED);
  const cancelledFlows = ORDER_FLOWS.filter((f) => f.at(-1) === ORDER_STATUS.CANCELLED);

  if (forceFinalStatus === ORDER_STATUS.CANCELLED) {
    return faker.helpers.arrayElement(cancelledFlows);
  }

  return faker.helpers.arrayElement(successFlows);
}

function generateOrderStatusHistory(forceFinalStatus = null) {
  const flow = weightedRandomFlow(forceFinalStatus);
  let currentDate = faker.date.past({ days: 10 });
  const history = [];

  for (const status of flow) {
    currentDate = faker.date.soon({ days: 2, refDate: currentDate });
    history.push({ status, updatedAt: currentDate });
  }

  return history;
}

function generateVietnamAddress(provinceName, districtName, wardName) {
  const streetName = faker.location.street();
  const houseNumber = faker.number.int({ min: 1, max: 999 });
  return `${houseNumber} ${streetName}, ${wardName}, ${districtName}, ${provinceName}`;
}

const totalOrders = 200;
const cancelledRatio = 0.2;

const orderDetails = [];
const orders = [];
const payments = [];

Array.from({ length: totalOrders }).map((_, index) => {
  const forceCancelled = index < totalOrders * cancelledRatio;
  const selected = faker.helpers.arrayElement(
    PAYMENT_FLOWS.filter((p) => (forceCancelled ? p.forceOrder === ORDER_STATUS.CANCELLED : true)),
  );
  const forceFinalStatus = forceCancelled ? ORDER_STATUS.CANCELLED : null;
  const status = selected.flow.at(-1);
  const isPaid = selected.flow.includes(PAYMENT_STATUS.PAID);
  const province = faker.helpers.arrayElement(provinces);
  const district = faker.helpers.arrayElement(getDistricts(province.province_code));
  const ward = faker.helpers.arrayElement(getWards(district.district_code));
  const orderDate = faker.date.recent({ days: 10 });

  const order = newOrderService({
    code: orderCodeGenerator.next().value,
    provinceName: province.name,
    districtName: district.name,
    wardName: ward.name,
    address: generateVietnamAddress(province.name, district.name, ward.name),
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email(),
    customerPhone: generateVietnamPhoneNumber(),
    trackingNumber: faker.string.alphanumeric({ length: 10 }),
    orderStatusHistory: generateOrderStatusHistory(forceFinalStatus),
    customer: faker.helpers.arrayElement(customers)._id,
    orderDate: orderDate,
    createdAt: orderDate,
  });

  const payment = newPaymentService({
    paymentUrl: isPaid ? faker.internet.url() : null,
    qrCodeUrl: isPaid ? faker.image.urlPlaceholder() : null,
    paymentMethod: faker.helpers.arrayElement(Object.values(ONLINE_PAYMENT_METHOD)),
    amountPaid: null,
    paidDate: isPaid ? faker.date.recent({ days: 5 }) : null,
    transactionId: isPaid ? faker.string.uuid() : null,
    status,
    order: order._id,
  });

  order.payment = payment._id;

  const orderItems = Array.from({ length: Math.ceil(Math.random() * 2) }).map((_, index) => {
    const quantity = faker.number.int({ min: 1, max: 2 });
    const randomVariant = faker.helpers.arrayElement(variants);
    const newDetail = newOrderDetailService({
      quantity,
      unitPrice: randomVariant.price,
      totalPrice: quantity * randomVariant.price,
      order: order._id,
      product: randomVariant.product,
      variant: randomVariant._id,
    });
    orderDetails.push(newDetail);
    return newDetail;
  });

  const { total, quantity } = orderItems.reduce(
    (prev, curr) => {
      prev.total += curr.totalPrice;
      prev.quantity += curr.quantity;
      return prev;
    },
    { total: 0, quantity: 0 },
  );

  if (isPaid) {
    payment.amountPaid = total;
  }

  order.subTotal = total;
  order.shippingFee = 0;
  order.total = total;
  order.quantity = quantity;
  order.orderDetails = orderItems.map((item) => item._id);

  orders.push(order);
  payments.push(payment);
});

export { payments, orderDetails, orders };
