## API Register

This endpoint is used to register a new customer.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/auth/register
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/auth/register
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "example",
    "email": "example@gmail.com",
    "phone": "0383460015",
    "password": "1234",
    "confirmPassword": "1234",
    "gender": "Male",
}'
```

### Parameter

| Param           | Require | Path | Type   | Description                          |
| --------------- | ------- | ---- | ------ | ------------------------------------ |
| name            | x       | body | String | Name                                 |
| email           | x       | body | String | Email address                        |
| phone           | x       | body | String | Phone                                |
| password        | x       | body | String | Password                             |
| confirmPassword | x       | body | String | Confirm password                     |
| gender          | x       | body | String | Gender <br>Enum: Male, Female, Other |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1742197301190,
  "data": {
    "isAuthenticated": false,
    "is2FactorRequired": true,
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
  "timestamp": 1742197322836,
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
      "path": "phone",
      "message": "\"phone\" is required"
    },
    {
      "path": "password",
      "message": "\"password\" is required"
    },
    {
      "path": "confirmPassword",
      "message": "\"confirmPassword\" is required"
    },
    {
      "path": "gender",
      "message": "\"gender\" is required"
    }
  ]
}
```

### Email Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Email already exists",
  "timestamp": 1742197357175,
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
