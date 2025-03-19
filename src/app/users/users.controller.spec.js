// import request from 'supertest';
// import HttpStatus from 'http-status-codes';
// import app from '#app';
// import userFactory from '#src/app/users/factory/user.factory';
// import permissionFactory from '#src/app/permissions/factory/permission.factory';
// import roleFactory from '#src/app/roles/factory/role.factory';

// describe('POST /api/users/create-user', () => {
//   const endpoint = '/api/users/create-user';
//   const dataCreateUser = {
//     name: 'user',
//     email: 'user@gmail.com',
//   };

//   describe('user not logged in', () => {
//     test('should return 401', async () => {
//       await request(app).post(endpoint).send(dataCreateUser).expect(HttpStatus.UNAUTHORIZED);
//     });
//   });

//   describe('token provided not right format', () => {
//     test('should return 400', async () => {
//       const user = await userFactory.createUser();
//       const token = generateToken({ _id: user._id });
//       await request(app).post(endpoint).set('Authorization', token).send(dataCreateUser).expect(HttpStatus.BAD_REQUEST);
//     });
//   });

//   describe('invalid or expired token', () => {
//     test('should return 401', async () => {
//       const user = await userFactory.createUser();
//       const token = generateToken({ _id: user._id }, '-10s');
//       await request(app)
//         .post(endpoint)
//         .set('Authorization', `Bearer ${token}`)
//         .send(dataCreateUser)
//         .expect(HttpStatus.UNAUTHORIZED);
//     });
//   });

//   describe('user does not have permission', () => {
//     test('should return 403', async () => {
//       const user = await userFactory.createUser();
//       const token = generateToken({ _id: user._id });
//       const { statusCode } = await request(app)
//         .post(endpoint)
//         .set('Authorization', `Bearer ${token}`)
//         .send(dataCreateUser)
//         .expect(HttpStatus.FORBIDDEN);
//     });
//   });

//   describe('validation error', () => {
//     test('should return a 422', async () => {
//       const permission = await permissionFactory.createPermission({
//         method: 'POST',
//         endpoint,
//       });
//       const role = await roleFactory.createRole({
//         permissions: [permission._id],
//       });
//       const user = await userFactory.createUser({
//         role: role._id,
//       });
//       const token = generateToken({ _id: user._id });
//       await request(app)
//         .post(endpoint)
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'user',
//         })
//         .expect(HttpStatus.UNPROCESSABLE_ENTITY);
//     });
//   });

//   describe('email already exist', () => {
//     test('should return a 429', async () => {
//       const permission = await permissionFactory.createPermission({
//         method: 'POST',
//         endpoint,
//       });
//       const role = await roleFactory.createRole({
//         permissions: [permission._id],
//       });
//       const user = await userFactory.createUser({
//         role: role._id,
//       });
//       const token = generateToken({ id: user._id });
//       await request(app)
//         .post(endpoint)
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'user',
//           email: user.email,
//         })
//         .expect(HttpStatus.CONFLICT);
//     });
//   });
// });
