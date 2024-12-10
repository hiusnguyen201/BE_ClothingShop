import express from "express";
const router = express.Router();

import usersRouter from "#src/routes/v1/users.route";
import authRouter from "#src/routes/v1/auth.route";
import rolesRouter from "#src/routes/v1/roles.route";
import permissionsRouter from "#src/routes/v1/permissions.route";
import customersRouter from "#src/routes/v1/customers.route"

router.use("/users", usersRouter);

router.use("/auth", authRouter);

router.use("/roles", rolesRouter);

router.use("/permissions", permissionsRouter);

router.use("/customers", customersRouter);

export default router;
