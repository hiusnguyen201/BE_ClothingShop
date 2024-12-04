import express from "express";
const router = express.Router();

import usersRouter from "#src/routes/v1/users.route";
import authRouter from "#src/routes/v1/auth.route";
import permissionsRouter from "#src/routes/v1/permissions.route";

router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/permissions", permissionsRouter);
export default router;
