## API Create User

This endpoint is used to create a new product by submitting data to the specified API endpoint.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/products/create-product
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/products/create-product
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/products/create-product' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--data-raw '{
    "name": "Product 1",
    "category": "67e81b0f118aaea8a91006a8",
    "subCategory": "67e81b0f118aaea8a91006a9",
    "shortDescription": "Short description",
    "content": "Content",
    "productVariants": [
        {
          "quantity": 1,
          "price": 2000,
          "sku": "sku 1",
          "image": "image.png",
          "variantValues": [
              {
                "option": "67e8166aa1be49f9a2500320",
                "optionValue": "67e8166aa1be49f9a2500324"
              },
              {
                "option": "67e8166aa1be49f9a2500322",
                "optionValue": "67e8166aa1be49f9a2500329"
              }
          ]
        }
      ]
}
```

### Parameter

| Param            | Require | Path   | Type         | Description       |
| ---------------- | ------- | ------ | ------------ | ----------------- |
| token            | x       | header | String       | Token             |
| name             | x       | body   | String       | Product name      |
| category         | x       | body   | String       | Category Id       |
| subCategory      |         | body   | String       | Sub Category Id   |
| shortDescription |         | body   | String       | Short description |
| content          |         | body   | String       | Content           |
| productVariants  | x       | body   | Array object | Product variant   |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1743272859343,
  "data": {
    "id": "67e83b9acd9f98505b5e61d9",
    "name": "Product 21",
    "slug": "product-21",
    "shortDescription": "abc",
    "content": "abc",
    "category": "67e81b0f118aaea8a91006a8",
    "productVariants": ["67e83b9acd9f98505b5e61da", "67e83b9acd9f98505b5e61db"],
    "createdAt": "2025-03-29T18:27:39.206Z",
    "updatedAt": "2025-03-29T18:27:39.206Z"
  }
}
```

### Structure Data Response

| Field            | Nullable | Type   | Description               |
| ---------------- | -------- | ------ | ------------------------- |
| id               |          | String | Product Id                |
| name             |          | String | Product name              |
| slug             |          | String | Product slung             |
| shortDescription | x        | String | Product short description |
| content          | x        | String | Product content           |
| category         |          | String | Product category          |
| subCategory      | x        | String | Product sub category      |
| productVariants  |          | Array  | Product variants          |
| createdAt        |          | String | Created At                |
| updatedAt        |          | String | Updated At                |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742235137527,
  "data": [
    {
      "path": "name",
      "message": "\"name\" is required"
    },
    {
      "path": "category",
      "message": "\"category\" is required"
    },
    {
      "path": "productVariants",
      "message": "\"productVariants\" is required"
    }
  ]
}
```

### Product name Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Product name already exist",
  "timestamp": 1742235454950,
  "data": null
}
```

### Category not found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Category not found",
  "timestamp": 1742235454950,
  "data": null
}
```

### Sub Category not found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Sub Category not found",
  "timestamp": 1742235454950,
  "data": null
}
```

### Option or Option value not found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Option or Option value not found",
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
