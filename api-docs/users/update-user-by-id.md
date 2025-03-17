## API Update User By ID

This endpoint is used to update a user by its ID.

[PUT](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/v1/users/update-user-by-id/:userId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/v1/users/update-user-by-id/:userId
```

#### Curl

```bash
curl --location --request PUT 'https://server-clothes-store.vercel.app/api/v1/users/update-user-by-id/67d7e61b5114396a4af8b95d' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--data-raw '{
    "name": "example",
    "email": "example@yahoo.com",
    "phone": "0912345678",
    "gender": "male"
}'
```

### Parameter

| Param  | Require | Path   | Type   | Description                                                  |
| ------ | ------- | ------ | ------ | ------------------------------------------------------------ |
| token  | x       | header | String | Token                                                        |
| userId | x       | params | String | User ID                                                      |
| name   | x       | body   | String | User name                                                    |
| email  | x       | body   | String | Email                                                        |
| gender | x       | body   | String | Gender<br>Enum: ["male", "female", "other"]<br>Default: null |
| phone  | x       | body   | String | Phone number with region 'VN'                                |
| roleId |         | body   | String | Role ID                                                      |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1742243383051,
  "data": {
    "id": "67d88216c4149464fb9533a4",
    "avatar": null,
    "name": "example",
    "email": "example@yahoo.com",
    "phone": "0912345678",
    "gender": "male",
    "status": "inactive",
    "isVerified": false,
    "verifiedAt": null,
    "createdAt": "2025-03-17T20:12:06.109Z",
    "updatedAt": "2025-03-17T20:29:43.043Z"
  }
}
```

### Structure Data Response

| Field      | Nullable | Type    | Description    |
| ---------- | -------- | ------- | -------------- |
| id         |          | String  | User Id        |
| avatar     | x        | String  | Avatar         |
| name       |          | String  | User name      |
| email      |          | String  | Email          |
| phone      |          | String  | Phone          |
| gender     |          | String  | Gender         |
| status     |          | String  | Status account |
| isVerified |          | Boolean | Is verified    |
| verifiedAt | x        | Boolean | Verified At    |
| createdAt  |          | String  | Created At     |
| updatedAt  |          | String  | Updated At     |

### INVALID_DATA (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742243123310,
  "data": [
    {
      "path": "name",
      "message": "\"name\" is required"
    },
    {
      "path": "email",
      "message": "\"email\" is required"
    },
    {
      "path": "gender",
      "message": "\"gender\" is required"
    },
    {
      "path": "phone",
      "message": "\"phone\" is required"
    }
  ]
}
```

### User Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "User not found",
  "timestamp": 1742213487548,
  "data": null
}
```

### Role Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Role not found",
  "timestamp": 1742213487548,
  "data": null
}
```

### Email Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Email already exists",
  "timestamp": 1742232644800,
  "data": null
}
```

### Too Many Request(429)

```json
{
  "code": 429,
  "codeMessage": "TOO_MANY_REQUESTS",
  "message": "Too many requests",
  "timestamp": 1742159809316,
  "data": null
}
```

### Internal Server Error (500)

```json
{
  "code": 500,
  "codeMessage": "SERVER_ERROR",
  "message": "Internal Server Error",
  "timestamp": 1742159809316,
  "data": null
}
```
