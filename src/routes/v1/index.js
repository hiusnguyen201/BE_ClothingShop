import express from "express";
const router = express.Router();

import usersRouter from "#src/users/users.route.js";

router.use("/users", usersRouter);

export default router;
