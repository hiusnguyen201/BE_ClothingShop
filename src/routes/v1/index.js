import express from "express";
const router = express.Router();

import usersRouter from "#src/routes/v1/users.route";
import authRouter from "#src/routes/v1/auth.route";
import rolesRouter from "#src/routes/v1/roles.route";
import permissionsRouter from "#src/routes/v1/permissions.route";
import customersRouter from "#src/routes/v1/customers.route";
import categoriesRouter from "#src/routes/v1/categories.route";
import vouchersRouter from "#src/routes/v1/vouchers.route";
import {
  hasPermission,
  isAuthorized,
} from "#src/middlewares/jwt-auth.middleware";

router.get("/ping", (req, res) => {
  return {
    message: "Hello, world! PING",
  };
});

router.use("/auth", authRouter);

// router.use([isAuthorized, hasPermission]);
router.use("/users", usersRouter);
router.use("/roles", rolesRouter);
router.use("/permissions", permissionsRouter);
router.use("/categories", categoriesRouter);
router.use("/customers", customersRouter);
router.use("/vouchers", vouchersRouter);

export default router;
