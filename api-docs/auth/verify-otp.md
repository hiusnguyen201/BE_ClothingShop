## API Verify OTP

This endpoint is used to verify the OTP (One-Time Password) for a user's authentication.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/auth/verify-otp
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/auth/verify-otp
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/auth/verify-otp' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userId": "67d7b8fadbb3f8fdb61352c1",
    "otp": "123456",
}'
```

### Parameter

| Param  | Require | Type   | Description     |
| ------ | ------- | ------ | --------------- |
| userId | x       | String | User Id address |
| otp    | x       | String | OTP code        |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Verify otp successfully",
  "timestamp": 1742201059901,
  "data": {
    "isAuthenticated": true,
    "is2FactorRequired": false,
    "user": {
      "id": "67d944d742e52209d72a1fde",
      "name": "Norma Schmitt",
      "email": "Mayra.Pfannerstill@gmail.com"
    }
  }
}
```

### Structure Data Response

| Field             | Nullable | Type    | Description         |
| ----------------- | -------- | ------- | ------------------- |
| isAuthenticated   |          | Boolean | Authenticated       |
| is2FactorRequired |          | Boolean | Two-Factor required |
| user              |          | Object  | User                |
| id                |          | String  | User ID             |
| name              |          | String  | User name           |
| email             |          | String  | Email               |

### Bad Request (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742200853993,
  "data": [
    {
      "path": "userId",
      "message": "\"userId\" is required"
    },
    {
      "path": "otp",
      "message": "\"otp\" is required"
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
  "timestamp": 1742198826946,
  "data": null
}
```

### Invalid Or Expired OTP (401)

```json
{
  "code": 401,
  "codeMessage": "UNAUTHORIZED",
  "message": "Invalid or expired otp",
  "timestamp": 1742200869585,
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
