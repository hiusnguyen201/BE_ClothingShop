import express from 'express';
const router = express.Router();

import usersRouter from '#src/routers/users.router';
import authRouter from '#src/routers/auth.router';
import rolesRouter from '#src/routers/roles.router';
import permissionsRouter from '#src/routers/permissions.router';
import customersRouter from '#src/routers/customers.router';
import categoriesRouter from '#src/routers/categories.router';
import vouchersRouter from '#src/routers/vouchers.router';
import accountRouter from '#src/routers/account.router';
import productsRouter from "#src/routers/products.route";
import productDiscountsRouter from "#src/routers/product-discounts.route";
import productReviewsRouter from '#src/routers/product-reviews.route';
import reviewFeedbacksRouter from '#src/routers/review-feedbacks.route';
// import productVariantsRouter from "#src/routers/product-variants.route";
import tagsRouter from "#src/routers/tags.route";
// import optionsRouter from "#src/routers/options.route";
// import productOptionsRouter from "#src/routers/product-options.route";
// import productOptionImagesRouter from "#src/routers/product-option-images.route";

router.get('/ping', () => 'Hello world! PING 1');

router.use('/auth', authRouter);

router.use('/account', accountRouter);

router.use('/users', usersRouter);

router.use('/roles', rolesRouter);

router.use('/permissions', permissionsRouter);

router.use('/categories', categoriesRouter);

router.use('/customers', customersRouter);

router.use('/vouchers', vouchersRouter);

router.use("/products", productsRouter);

router.use("/product-discounts", productDiscountsRouter);

router.use("/product-reviews", productReviewsRouter);

router.use("/review-feedbacks", reviewFeedbacksRouter);

// router.use("/product-variants", productVariantsRouter);

router.use("/tags", tagsRouter);

// router.use("/options", optionsRouter);

// router.use("/product-options", productOptionsRouter);

// router.use("/product-option-images", productOptionImagesRouter);

export default router;
