import express from "express";
const router = express.Router();

import usersRouter from "#src/routes/v1/users.route";
import authRouter from "#src/routes/v1/auth.route";

router.use("/users", usersRouter);
router.use("/auth", authRouter);

export default router;
