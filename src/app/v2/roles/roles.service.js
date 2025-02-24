import { RoleModel } from '#models/role.model';

class RoleService {
  async checkExistRoleById(adapter) {
    const { id } = adapter;
    const result = await RoleModel.exists({ _id: id });
    return !!result;
  }
}

export default new RoleService();
