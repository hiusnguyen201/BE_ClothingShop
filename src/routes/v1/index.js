import express from "express";
const router = express.Router();

import usersRouter from "#src/routes/v1/users.route";

router.use("/users", usersRouter);

export default router;
