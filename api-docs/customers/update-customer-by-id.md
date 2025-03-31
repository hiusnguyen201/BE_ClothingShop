## API Update Customer By ID

This endpoint is used to update a customer by its ID.

[PATCH](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/customers/update-customer-by-id/:customerId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/customers/update-customer-by-id/:customerId
```

#### Curl

```bash
curl --location --request PATCH 'https://server-clothes-store.vercel.app/api/customers/update-customer-by-id/67d7e61b5114396a4af8b95d' \
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

| Param      | Require | Path   | Type   | Description                                                  |
| ---------- | ------- | ------ | ------ | ------------------------------------------------------------ |
| token      | x       | header | String | Token                                                        |
| customerId | x       | params | String | Customer ID                                                  |
| name       |         | body   | String | Customer name                                                |
| email      |         | body   | String | Email                                                        |
| gender     |         | body   | String | Gender<br>Enum: ["male", "female", "other"]<br>Default: null |
| phone      |         | body   | String | Phone number with region 'VN'                                |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Update customer successfully",
  "timestamp": 1742293268037,
  "data": {
    "id": "67d944d742e52209d72a1fde",
    "avatar": null,
    "name": "example",
    "email": "example@yahoo.com",
    "phone": "0912345678",
    "gender": "male",
    "verifiedAt": null
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

### INVALID_DATA (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742293223729,
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

### Customer Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Customer not found",
  "timestamp": 1742213487548,
  "data": null
}
```

### Email Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Email already exists",
  "timestamp": 1742232644800,
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
