## API Reset Password

This endpoint is used to reset the password by providing the reset token and the new password.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/v1/auth/reset-password/:token
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/v1/auth/reset-password/:token
```

#### Curl

```bash
curl --location --request POST 'https://server-clothes-store.vercel.app/api/v1/auth/reset-password/:token' \
--header 'Content-Type: application/json' \
--data-raw '{
    "password": "1234",
    "confirmPassword": "1234",
}'
```

### Parameter

| Param           | Require | Path   | Type   | Description      |
| --------------- | ------- | ------ | ------ | ---------------- |
| token           | x       | params | String | Token            |
| password        | x       | body   | String | New password     |
| confirmPassword | x       | body   | String | Confirm password |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Reset password successfully",
  "timestamp": 1742199960622,
  "data": true
}
```

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742199790293,
  "data": [
    {
      "path": "password",
      "message": "\"password\" is required"
    },
    {
      "path": "confirmPassword",
      "message": "\"confirmPassword\" is required"
    }
  ]
}
```

### Invalid Or Expired Token (401)

```json
{
  "code": 401,
  "codeMessage": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "timestamp": 1742199824113,
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
