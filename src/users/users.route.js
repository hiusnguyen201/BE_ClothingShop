import express from "express";
const router = express.Router();

import {
  create,
  findAll,
  findOne,
  update,
  remove,
} from "#src/users/users.controller.js";

router.route("/").get(findAll).post(create);

router.route("/:identify").get(findOne).patch(update).delete(remove);

export default router;
