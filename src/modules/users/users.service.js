import { User } from "#src/modules/users/schemas/user.schema";
import { NotFoundException } from "#src/http-exception";

export default { create, findAll, findOne, update, remove };

async function create(data) {
  const user = await User.create({
    _id: 1,
  });
  return user;
}

function findAll() {
  return "hello";
}

function findOne() {
  return "hello";
}

function update() {
  return "hello";
}

function remove() {
  return "hello";
}
