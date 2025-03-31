## API Edit profile

This endpoint is used to update the profile information for the account.

[PATCH](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/account/edit-profile
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/account/edit-profile
```

#### Curl

```bash
curl --request PATCH 'https://server-clothes-store.vercel.app/api/account/edit-profile' \
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
| name   |         | body   | String | Customer name                                                |
| email  |         | body   | String | Email                                                        |
| gender |         | body   | String | Gender<br>Enum: ["male", "female", "other"]<br>Default: null |
| phone  |         | body   | String | Phone number with region 'VN'                                |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1742382346261,
  "data": {
    "id": "67da9e0595571fe606993042",
    "avatar": null,
    "name": "hello1",
    "email": "Timmy_Nitzsche72@hotmail.com",
    "phone": "0912345657",
    "gender": "male",
    "verifiedAt": "2025-03-19T10:37:57.979Z"
  }
}
```

### Structure Data Response

| Field      | Nullable | Type    | Description   |
| ---------- | -------- | ------- | ------------- |
| id         |          | String  | Customer Id   |
| avatar     | x        | String  | Avatar        |
| name       |          | String  | Customer name |
| email      |          | String  | Email         |
| phone      |          | String  | Phone         |
| gender     |          | String  | Gender        |
| verifiedAt | x        | Boolean | Verified At   |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742292472791,
  "data": [
    {
      "path": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

### Email Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Email already exist",
  "timestamp": 1742235454950,
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
