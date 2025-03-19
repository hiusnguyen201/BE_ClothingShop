## API Get Customer By ID

This endpoint is used to retrieve a specific customer by its ID.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/customers/get-customer-by-id/:customerId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/customers/get-customer-by-id/:customerId
```

#### Curl

```bash
curl --request GET 'https://server-clothes-store.vercel.app/api/customers/get-customer-by-id/67d7e61b5114396a4af8b95d' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
```

### Parameter

| Param      | Require | Path   | Type   | Description |
| ---------- | ------- | ------ | ------ | ----------- |
| token      | x       | header | String | Token       |
| customerId | x       | params | String | Customer ID |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Get customer successfully",
  "timestamp": 1742293088496,
  "data": {
    "id": "67d944d742e52209d72a1fde",
    "avatar": null,
    "name": "Norma Schmitt",
    "email": "Mayra.Pfannerstill@gmail.com",
    "phone": "0383460015",
    "gender": "male",
    "birthday": null,
    "status": "inactive",
    "verifiedAt": null,
    "createdAt": "2025-03-18T10:03:03.278Z",
    "updatedAt": "2025-03-18T10:03:03.278Z"
  }
}
```

### Structure Data Response

| Field      | Nullable | Type    | Description    |
| ---------- | -------- | ------- | -------------- |
| id         |          | String  | Customer Id    |
| avatar     | x        | String  | Avatar         |
| name       |          | String  | Customer name  |
| email      |          | String  | Email          |
| phone      |          | String  | Phone          |
| gender     |          | String  | Gender         |
| birthday   | x        | String  | Birthday       |
| status     |          | String  | Status account |
| verifiedAt | x        | Boolean | Verified At    |
| createdAt  |          | String  | Created At     |
| updatedAt  |          | String  | Updated At     |

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
