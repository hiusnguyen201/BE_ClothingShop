import "dotenv/config";
import mongoose from "mongoose";
import { PERMISSIONS_LIST } from "./permissions.seeder.js";
import { createPermissionsWithinTransactionService } from "#src/modules/permissions/permissions.service";
import { createUsersWithinTransactionService } from "#src/modules/users/users.service";
import { makeHash } from "#src/utils/bcrypt.util";
import { USER_TYPES } from "#src/core/constant";
import { createRolesWithinTransactionService } from "#src/modules/roles/roles.service";
import { makeSlug } from "#src/utils/string.util";

/**
 * Need fix MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
 * - Stop mongodb service
 *
 * - Add the replication in file mongod.conf:
 * replication:
 *  replSetName: "rs0"
 *
 * - Start mongodb service
 *
 * - Run rs.initiate() in mongo shell
 * - Check replica set is configured: rs.status()
 */
async function runSeeder() {
  await mongoose.connect(process.env.MONGO_URI);
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    // Permissions
    const result = await createPermissionsWithinTransactionService(
      PERMISSIONS_LIST
    );

    // Role admin
    const roles = await createRolesWithinTransactionService(
      {
        name: "Admin",
        isActive: true,
        slug: makeSlug("Admin"),
        permissions: result.map((item) => item._id),
      },
      session
    );

    // Admin account
    await createUsersWithinTransactionService(
      {
        name: "Admin 123",
        email: "admin123@gmail.com",
        password: makeHash("1234"),
        isVerified: true,
        role: roles[0]._id,
        type: USER_TYPES.USER,
      },
      session
    );

    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
    await mongoose.connection.close();
  }
}

runSeeder();
