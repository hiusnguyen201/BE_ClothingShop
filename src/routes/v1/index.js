import express from "express";
const router = express.Router();

import usersRouter from "#src/routes/v1/users.route";
import authRouter from "#src/routes/v1/auth.route";
import rolesRouter from "#src/routes/v1/roles.route";
import permissionsRouter from "#src/routes/v1/permissions.route";
import customersRouter from "#src/routes/v1/customers.route";
import categoriesRouter from "#src/routes/v1/categories.route";
import vouchersRouter from "#src/routes/v1/vouchers.route";
import accountRouter from "#src/routes/v1/account.route";
import productsRouter from "#src/routes/v1/products.route";
import productVariantsRouter from "#src/routes/v1/product-variants.route";
import tagsRouter from "#src/routes/v1/tags.route";
import optionsRouter from "#src/routes/v1/options.route";
import productOptionsRouter from "#src/routes/v1/product-options.route";
import productDiscountsRouter from "#src/routes/v1/product-discounts.route";
import productOptionImagesRouter from "#src/routes/v1/product-option-images.route";

router.get("/ping", (req, res) => {
  return "Hello, world! PING";
});

router.use("/auth", authRouter);

router.use("/account", accountRouter);

router.use("/users", usersRouter);

router.use("/roles", rolesRouter);

router.use("/permissions", permissionsRouter);

router.use("/categories", categoriesRouter);

router.use("/customers", customersRouter);

router.use("/vouchers", vouchersRouter);

router.use("/products", productsRouter);

router.use("/product-variants", productVariantsRouter);

router.use("/tags", tagsRouter);

router.use("/options", optionsRouter);

router.use("/product-options", productOptionsRouter);

router.use("/product-discounts", productDiscountsRouter);

router.use("/product-option-images", productOptionImagesRouter);
export default router;
