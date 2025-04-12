## API Send OTP Via Email

This endpoint is used to send a one-time password (OTP) to the provided email address for authentication purposes.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/auth/send-otp-via-email
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/auth/send-otp-via-email
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/auth/send-otp-via-email' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "example@gmail.com",
}'
```

### Parameter

| Param | Require | Type   | Description   |
| ----- | ------- | ------ | ------------- |
| email | x       | String | Email address |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Send otp via email successful",
  "timestamp": 1742200311115,
  "data": null
}
```

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742200164963,
  "data": [
    {
      "path": "email",
      "message": "\"email\" is required"
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

### Too Many Send Mail (429)

```json
{
  "code": 429,
  "codeMessage": "TOO_MANY_SEND_MAIL",
  "message": "Please wait 111 seconds before requesting another OTP",
  "timestamp": 1742200566445,
  "data": null
}
```

### Too Many Request (429)

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
