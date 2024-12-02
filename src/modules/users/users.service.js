import { isValidObjectId } from "mongoose";
import bcrypt from "bcrypt";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import {
  cropImagePathByVersion,
  uploadImageBuffer,
} from "#src/modules/cloudinary/cloudinary.service";

const SELECTED_FIELDS = "_id avatar name email status birthday gender";

export async function createUser(data) {
  const newUser = await UserModel.create({
    ...data,
    type: USER_TYPES.USER,
  });

  if (data?.file) {
    await updateUserAvatarById(newUser._id, data.file);
  }

  return await findUserById(user._id);
}

export async function createCustomer(data) {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(data.password, salt);
  const newCustomer = await UserModel.create({
    ...data,
    type: USER_TYPES.CUSTOMER,
    password: hashedPassword,
  });

  if (data?.file) {
    await updateUserAvatarById(newCustomer._id, data.file);
  }

  return await findUserById(newCustomer._id);
}

export async function findAllUsers(query, selectFields = SELECTED_FIELDS) {
  let { keyword, status, itemPerPage = 10, page = 1 } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
    [status && "status"]: status,
  };

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
    .select(selectFields);

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

export async function findUserById(id, selectFields = SELECTED_FIELDS) {
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (REGEX_PATTERNS.EMAIL.test(id)) {
    filter.email = id;
  } else {
    return null;
  }

  return await UserModel.findOne(filter).select(selectFields);
}

export async function updateUserById(id, data) {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { ...data },
    { new: true }
  ).select(SELECTED_FIELDS);

  if (data?.file) {
    await updateUserAvatarById(user._id, data.file);
  }

  return user;
}

export async function removeUserById(id) {
  return await UserModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

export async function checkExistedUserById(id) {
  const existUser = await findUserById(id, "_id");
  return Boolean(existUser);
}

export async function updateUserAvatarById(id, file) {
  const folderName = "avatars";
  const result = await uploadImageBuffer({
    file,
    folderName,
  });

  const cropImagePath = cropImagePathByVersion({
    url: result.url,
    version: result.version,
  });

  return await UserModel.findByIdAndUpdate(
    id,
    {
      avatar: cropImagePath,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}
