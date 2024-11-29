import express from "express";
const router = express.Router();

import {
  create,
  findAll,
  findOne,
  update,
  remove,
} from "#src/modules/users/users.controller";

router.route("/").get(findAll).post(create);

router.route("/:identify").get(findOne).patch(update).delete(remove);

export default router;
