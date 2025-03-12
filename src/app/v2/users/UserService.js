import { ConflictException, NotFoundException } from '#core/exception/http-exception';
import { Assert } from '#core/assert/Assert';
import { UserModel } from '#models/user.model';
import { UserSchemaDto } from '#app/v2/users/dtos/UserSchemaDto';
import { randomStr } from '#utils/string.util';
import cloudinaryService from '#modules/cloudinary/CloudinaryService';
import { sendPasswordService } from '#modules/mailer/mailer.service';
import roleService from '#app/v2/roles/roles.service';
import { UserConstant } from '#app/v2/users/UserConstant';
import { getSortObject } from '#utils/sort.util';

class UserService {
  nameFolderAvatar = 'avatars';

  async createUser(adapter) {
    const { email, roleId, avatar } = adapter;

    const isExistEmail = await this.checkExistUser({ email });
    Assert.isFalse(isExistEmail, new ConflictException('Email already exist'));

    if (roleId) {
      const isExistRole = await roleService.checkExistRoleById(roleId);
      Assert.isTrue(isExistRole, new NotFoundException('Role not found'));
      adapter.role = roleId;
    }

    const password = randomStr(10);
    const user = new UserModel({ ...adapter, isVerified: false, type: UserConstant.USER_TYPES.USER });
    await user.hashPassword(password);

    if (avatar) {
      const result = await cloudinaryService.uploadImageBuffer({
        buffer: avatar,
        folderName: this.nameFolderAvatar,
      });
      if (result) user.avatar = result.url;
    }

    const savedUser = await user.save();

    // Send password to mail for user
    sendPasswordService(email, password);

    return UserSchemaDto.newFromUser(savedUser);
  }

  async getUserList(adapter) {
    const { keyword, page, limit, status } = adapter;

    const filters = {
      type: UserConstant.USER_TYPES.USER,
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
      ],
      ...(status === UserConstant.USER_STATUS.ACTIVE && { isVerified: true }),
      ...(status === UserConstant.USER_STATUS.INACTIVE && { isVerified: false }),
    };

    const offset = (page - 1) * limit;
    const sorts = getSortObject(adapter.sortBy, adapter.sortOrder);

    const users = await UserModel.find(filters).skip(offset).limit(limit).sort(sorts).lean();

    const totalCount = await this.countAllUsers(filters);

    return {
      meta: { totalCount, offset, page, limit },
      list: UserSchemaDto.newListFromUsers(users),
    };
  }

  async getUserById(adapter) {
    const { userId } = adapter;

    const user = await UserModel.findOne({
      type: UserConstant.USER_TYPES.USER,
      _id: userId,
    }).lean();

    Assert.isTrue(user, new NotFoundException('User not found'));

    return UserSchemaDto.newFromUser(user);
  }

  async updateUserInfoById(adapter) {
    const { userId, email, roleId } = adapter;
    await this.getUserById({ userId });

    const isExistEmail = await this.checkExistUser({ email, _id: { $ne: userId } });
    Assert.isFalse(isExistEmail, new ConflictException('Email already exist'));

    if (roleId) {
      const isExistRole = await roleService.checkExistRoleById(roleId);
      Assert.isTrue(isExistRole, new NotFoundException('Role not found'));
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, adapter, { new: true }).lean();

    return UserSchemaDto.newFromUser(updatedUser);
  }

  async updateUserAvatarById(adapter) {
    const { userId, avatar } = adapter;
    await this.getUserById({ userId });

    const result = await cloudinaryService.uploadImageBuffer({
      buffer: avatar,
      folderName: this.nameFolderAvatar,
    });

    adapter.avatar = result.url;

    const updatedUser = await UserModel.findByIdAndUpdate(userId, adapter, { new: true }).lean();

    return UserSchemaDto.newFromUser(updatedUser);
  }

  async removeUserById(adapter) {
    const { userId } = adapter;
    await this.getUserById({ userId });

    const removedUser = await UserModel.findByIdAndSoftDelete(userId).lean();

    return UserSchemaDto.newFromUser(removedUser);
  }

  async checkExistUser(adapter) {
    const { userId, email } = adapter;
    const result = await UserModel.findOne({ email, _id: userId }, '_id', { withDeleted: true }).lean();
    return !!result;
  }

  async countAllUsers(filters) {
    return UserModel.countDocuments(filters);
  }
}

export default new UserService();
