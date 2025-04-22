## API Remove User By ID

This endpoint is used to update a product by its ID.

[DELETE](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/users/remove-product-by-id/:productId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/products/remove-product-by-id/:productId
```

#### Curl

```bash
curl --request DELETE 'https://server-clothes-store.vercel.app/api/products/remove-product-by-id/67d7e61b5114396a4af8b95d' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
```

### Parameter

| Param     | Require | Path   | Type   | Description |
| --------- | ------- | ------ | ------ | ----------- |
| token     | x       | header | String | Token       |
| productId | x       | params | String | Product ID  |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1743275567202,
  "data": {
    "id": "67e81fef956727a0b7881bf1"
  }
}
```

### Product Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Product not found",
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
