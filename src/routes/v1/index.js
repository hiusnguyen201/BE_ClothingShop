import express from "express";
const router = express.Router();

import usersRouter from "#src/routes/v1/users.route";
import authRouter from "#src/routes/v1/auth.route";
import roleRouter from "#src/routes/v1/role.route";

router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/roles", roleRouter);

export default router;
