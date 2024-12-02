import { User } from "#src/modules/users/schemas/user.schema";
import { NotFoundException } from "#src/http-exception";
import { isValidObjectId } from "mongoose";
import { REGEX_PATTERNS, USER_TYPES } from "#src/constants";

export async function createUser(data, file) {
  const newUser = await User.create({
    ...data,
    type: USER_TYPES.USER,
  });

  if (file) {
    // Save avatar
  }

  return newUser;
}

export async function createCustomer(data, file) {
  const newCustomer = await User.create({
    ...data,
    type: USER_TYPES.CUSTOMER,
  });

  if (file) {
    // Save avatar
  }

  return newCustomer;
}

export async function findAllUsers(data) {
  let {
    keyword,
    sortBy = "name-atoz",
    status,
    itemPerPage = 10,
    page = 1,
  } = data;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } }, // Option "i" - Search lowercase and uppercase
      { email: { $regex: keyword, $options: "i" } },
    ],
    [status && "status"]: status,
  };

  let sort = {};
  switch (sortBy) {
    case "name-atoz":
      sort.name = 1;
      break;
    case "name-ztoa":
      sort.name = -1;
      break;
    default:
      sort.name = 1;
      break;
  }

  const totalItems = await User.countDocuments(filters);
  const totalPages = Math.ceil(totalItems / itemPerPage);

  if (page <= 0 || !page) {
    page = 1;
  } else if (page > totalPages && totalPages >= 1) {
    page = totalPages;
  }

  const offSet = (page - 1) * itemPerPage;

  const users = await User.find(filterOptions)
    .skip(offSet)
    .limit(itemPerPage);

  return {
    list: users,
    meta: {
      offSet,
      itemPerPage,
      currentPage: page,
      totalPages,
      totalItems,
      isNext: page < totalPages,
      isPrevious: page > 1,
      isFirst: page > 1 && page <= totalPages,
      isLast: page >= 1 && page < totalPages,
    },
  };
}

export async function findUser(identify, SELECTED_FIELD) {
  const filter = {};

  if (isValidObjectId(identify)) {
    filter._id = identify;
  } else if (REGEX_PATTERNS.EMAIL.test(identify)) {
    filter.email = identify;
  } else {
    return null;
  }

  return await User.findOne(filter).select(SELECTED_FIELD);
}

export async function updateUser(id, data) {
  const { avatar, name, phone, birthday, gender } = data;

  const user = await User.findByIdAndUpdate(
    id,
    { avatar, name, phone, birthday, gender },
    { new: true }
  );

  if (!user) {
    throw new NotFoundException("User not found");
  }

  return user;
}

export async function removeUser(id) {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  return user;
}
