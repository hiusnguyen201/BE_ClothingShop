## API Login

This endpoint is used to authenticate a user and obtain an access token.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/v1/auth/login
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/v1/auth/login
```

#### Curl

```bash
curl --location --request POST 'https://server-clothes-store.vercel.app/api/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "example@gmail.com",
    "password": "1234",
}'
```

### Parameter

| Param    | Require | Path | Type   | Description   |
| -------- | ------- | ---- | ------ | ------------- |
| email    | x       | body | String | Email address |
| password | x       | body | String | Password      |

### Success (200)

```json
{
  "code": 200,
  "message": "Success",
  "codeMessage": "SUCCESS",
  "timestamp": 1742196837168,
  "data": {
    "isAuthenticated": true,
    "is2FactorRequired": false,
    "user": {
      "id": "67d7b8fadbb3f8fdb61352c1",
      "name": "example",
      "email": "example@gmail.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo"
    }
  }
}
```

### Structure Data Response

| Field             | Nullable | Type    | Description                            |
| ----------------- | -------- | ------- | -------------------------------------- |
| isAuthenticated   |          | Boolean | Authenticated                          |
| is2FactorRequired |          | Boolean | Two-Factor required                    |
| user              |          | Object  | User                                   |
| id                |          | String  | User ID                                |
| name              |          | String  | User name                              |
| email             |          | String  | User email                             |
| tokens            | x        | Object  | Contain access token and refresh token |
| accessToken       |          | String  | Access token                           |
| refreshToken      |          | String  | Refresh token                          |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742159717531,
  "data": [
    {
      "path": "email",
      "message": "\"email\" is required"
    },
    {
      "path": "password",
      "message": "\"password\" is required"
    }
  ]
}
```

### Invalid Credentials (401)

```json
{
  "code": 401,
  "codeMessage": "UNAUTHORIZED",
  "message": "Invalid Credentials",
  "timestamp": 1742196764866,
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
