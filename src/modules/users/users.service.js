import { User } from "#src/modules/users/schemas/user.schema";

export default { create, findAll, findOne, update, remove };

async function create(data) {
  const { avatar = "", name, phone, birthday, gender } = data;

  const newUser = await User.create({
    avatar: avatar,
    name: name,
    phone: phone,
    birthday: birthday,
    gender: gender
  })
  return newUser;
}

async function findAll(data) {
  let { keyword, sortBy = "name-atoz", status, itemPerPage = 10, page = 1 } = data;

  let filters = {};

  if (keyword) {
    const regEx = new RegExp(keyword, 'i');
    filters = {
      $or: [
        { name: regEx },
        { email: regEx },
      ]
    }
  }

  if (status) {
    filters.status = { $in: status }
  }

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

  if (page < 0) {
    page = 1;
  } else if (page > totalPages) {
    page = totalPages;
  }

  const offSet = (page - 1) * itemPerPage;

  const users = await User.find(filters).skip(offSet).limit(itemPerPage).sort(sort);

  return {
    users,
    pagination: {
      offSet,
      itemPerPage,
      currentPage: page,
      totalPages,
      totalItems,
      isNext: page < totalPages,
      isPrevious: page > 1 ,
      isFirst: page > 1 && page <= totalPages,
      isLast: page >= 1 && page < totalPages 
    }
  }
}

async function findOne(id) {
  const user = await User.findById(id);

  if (!user) {
    throw new Error();
  }

  return user;
}

async function update(id, data) {
  const { avatar, name, phone, birthday, gender } = data;
  const user = await User.findByIdAndUpdate(id, { avatar, name, phone, birthday, gender }, { new: true });

  if (!user) {
    throw new Error();
  }
  return user;
}

async function remove(id) {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error();
  }

  return "Deleted";
}
