## API Change Password

This endpoint is used to update the profile information for the account.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/account/change-password
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/account/change-password
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/account/change-password' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--data-raw '{
    "password": "123",
    "newPassword": "1234",
    "confirmNewPassword": "1234",
}'
```

### Parameter

| Param              | Require | Path   | Type   | Description          |
| ------------------ | ------- | ------ | ------ | -------------------- |
| token              | x       | header | String | Token                |
| password           | x       | body   | String | Current password     |
| newPassword        | x       | body   | String | New password         |
| confirmNewPassword | x       | body   | String | Confirm new password |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1742382647521,
  "data": true
}
```

### Structure Data Response

| Field | Nullable | Type    | Description |
| ----- | -------- | ------- | ----------- |
| data  |          | Boolean | Data        |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742382629655,
  "data": [
    {
      "path": "password",
      "message": "\"password\" is required"
    },
    {
      "path": "newPassword",
      "message": "\"newPassword\" is required"
    },
    {
      "path": "confirmNewPassword",
      "message": "\"confirmNewPassword\" is required"
    }
  ]
}
```

### Password Is Incorrect (401)

```json
{
  "code": 401,
  "codeMessage": "UNAUTHORIZED",
  "message": "Password is not correct",
  "timestamp": 1742382585094,
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
