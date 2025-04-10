## API Login

This endpoint is used to authenticate a user and obtain an access token.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/auth/login
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/auth/login
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/auth/login' \
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
