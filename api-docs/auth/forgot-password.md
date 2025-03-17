## API Forgot Password

This endpoint is used to initiate the process of resetting a customer's password.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/v1/auth/forgot-password
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/v1/auth/forgot-password
```

#### Curl

```bash
curl --location --request POST 'https://server-clothes-store.vercel.app/api/v1/auth/forgot-password' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "example@gmail.com",
    "callbackUrl": "https://client-clothes-store.vercel.app/auth/reset-password",
}'
```

### Parameter

| Param       | Require | Type   | Description                                                       |
| ----------- | ------- | ------ | ----------------------------------------------------------------- |
| email       | x       | String | Email address                                                     |
| callbackUrl | x       | String | This url is used for customer to click on the link in their email |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Required Forgot Password Success",
  "timestamp": 1742198710085,
  "data": null
}
```

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742198759296,
  "data": [
    {
      "path": "email",
      "message": "\"email\" is required"
    },
    {
      "path": "callbackUrl",
      "message": "\"callbackUrl\" is required"
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
