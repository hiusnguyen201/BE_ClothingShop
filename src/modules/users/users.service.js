import { UserModel } from "#src/modules/users/schemas/user.schema";
import { isValidObjectId } from "mongoose";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";

export async function createUser(data) {
  const newUser = await UserModel.create({
    ...data,
    type: USER_TYPES.USER,
  });

  if (data?.file) {
    // Save avatar
  }

  return newUser;
}

export async function createCustomer(data) {
  const newCustomer = await UserModel.create({
    ...data,
    type: USER_TYPES.CUSTOMER,
  });

  if (data?.file) {
    // Save avatar
  }

  return newCustomer;
}

export async function findAllUsers(query, SELECTED_FIELD = "-password") {
  let {
    keyword,
    // sortBy = "name-atoz",
    status,
    itemPerPage = 10,
    page = 1,
  } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } }, // Option "i" - Search lowercase and uppercase
      { email: { $regex: keyword, $options: "i" } },
    ],
    [status && "status"]: status,
  };

  // let sort = {};
  // switch (sortBy) {
  //   case "name-atoz":
  //     sort.name = 1;
  //     break;
  //   case "name-ztoa":
  //     sort.name = -1;
  //     break;
  //   default:
  //     sort.name = 1;
  //     break;
  // }

  const totalItems = await UserModel.countDocuments(filters);
  const totalPages = Math.ceil(totalItems / itemPerPage);

  if (page <= 0 || !page) {
    page = 1;
  } else if (page > totalPages && totalPages >= 1) {
    page = totalPages;
  }

  const offSet = (page - 1) * itemPerPage;

  const users = await UserModel.find(filterOptions)
    .skip(offSet)
    .limit(itemPerPage)
    .select(SELECTED_FIELD);

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

export async function findUserById(id, SELECTED_FIELD = "-password") {
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (REGEX_PATTERNS.EMAIL.test(id)) {
    filter.email = id;
  } else {
    return null;
  }

  return await UserModel.findOne(filter).select(SELECTED_FIELD);
}

export async function findUserByResetPasswordToken(token) {
  const user = await UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() }
  })
  return user
}

export async function findUserByCodeVerifiEmail(code) {
  const user = await UserModel.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: Date.now() }
  })
  return user
}

export async function updateUserById(id, data) {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { ...data },
    { new: true }
  );

  if (data?.file) {
    // Save avatar
  }

  return user;
}

export async function removeUserById(id) {
  return await UserModel.findByIdAndDelete(id);
}

export async function checkExistedUserById(id) {
  const existUser = await findUserById(id, "_id");
  return Boolean(existUser);
}
