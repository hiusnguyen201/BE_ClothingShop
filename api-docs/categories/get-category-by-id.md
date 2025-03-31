## API Get Category By ID

This endpoint is used to retrieve a specific category by its ID.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/categories/get-category-by-id/:categoryId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/categories/get-category-by-id/:categoryId
```

#### Curl

```bash
curl --request GET 'https://server-clothes-store.vercel.app/api/categories/get-category-by-id/67d7e61b5114396a4af8b95d' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
```

### Parameter

| Param      | Require | Path   | Type   | Description |
| ---------- | ------- | ------ | ------ | ----------- |
| token      | x       | header | String | Token       |
| categoryId | x       | params | String | Category ID |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Get one category successfully",
  "timestamp": 1742374592997,
  "data": {
    "id": "67da86312d0dfdb03567ad28",
    "image": "http://res.cloudinary.com/dsfkimwl7/image/upload/v1742374445/categories-image/1742374443473_865f14a6-d3d1-4d0d-868c-224de5894ec6.jpg",
    "name": "Johnny Hoeger",
    "slug": "johnny-hoeger",
    "level": 1
  }
}
```

### Structure Data Response

| Field | Nullable | Type   | Description       |
| ----- | -------- | ------ | ----------------- |
| id    |          | String | Category Id       |
| image |          | String | Category image    |
| name  |          | String | Category name     |
| slug  |          | String | Slug              |
| level |          | Number | Level of category |

### Category Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Category not found",
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
