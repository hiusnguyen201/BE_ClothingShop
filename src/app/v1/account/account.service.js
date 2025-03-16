import { UserModel } from '#src/models/user.model';
import { compare } from 'bcrypt';

export async function comparePasswordService(userId, password) {
  const user = await UserModel.findById(userId).select({ password: true }).lean();
  return compare(password, user.password);
}
