import express from "express";
const router = express.Router();

import usersRouter from "#src/modules/users/users.route";

router.use("/users", usersRouter);

export default router;
