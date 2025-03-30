## API Create Customer

This endpoint is used to create a new customer by submitting data to the specified API endpoint.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/customers/create-customer
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/customers/create-customer
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/customers/create-customer' \
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
| name   | x       | body   | String | Customer name                                                |
| email  | x       | body   | String | Email                                                        |
| gender | x       | body   | String | Gender<br>Enum: ["male", "female", "other"]<br>Default: null |
| phone  | x       | body   | String | Phone number with region 'VN'                                |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Create customer successfully",
  "timestamp": 1742292183292,
  "data": {
    "id": "67d944d742e52209d72a1fde",
    "avatar": null,
    "name": "Norma Schmitt",
    "email": "Mayra.Pfannerstill@gmail.com",
    "phone": "0383460015",
    "gender": "male",
    "verifiedAt": null,
    "createdAt": "2025-03-18T10:03:03.278Z",
    "updatedAt": "2025-03-18T10:03:03.278Z"
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
| createdAt  |          | String  | Created At    |
| updatedAt  |          | String  | Updated At    |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742292472791,
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
