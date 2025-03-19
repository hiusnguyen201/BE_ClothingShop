## API Remove Customer By ID

This endpoint is used to update a customer by its ID.

[DELETE](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/customers/remove-customer-by-id/:customerId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/customers/remove-customer-by-id/:customerId
```

#### Curl

```bash
curl --request DELETE 'https://server-clothes-store.vercel.app/api/customers/remove-customer-by-id/67d7e61b5114396a4af8b95d' \
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
  "message": "Remove customer successfully",
  "timestamp": 1742293375078,
  "data": null
}
```

### Customer Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Customer not found",
  "timestamp": 1742233056577,
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
