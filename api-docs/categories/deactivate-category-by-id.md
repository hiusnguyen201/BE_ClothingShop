## API Deactivate Category By Id

This endpoint is used to update a category by its ID.

[PATCH](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/categories/deactivate-category-by-id/:categoryId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/categories/deactivate-category-by-id/:categoryId
```

#### Curl

```bash
curl --request PATCH 'https://server-clothes-store.vercel.app/api/categories/deactivate-category-by-id/67d7e61b5114396a4af8b95d' \
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
  "message": "Deactivate category successfully",
  "timestamp": 1742377870189,
  "data": {
    "id": "67da8ad53c69aad6ef156994",
    "image": "http://res.cloudinary.com/dsfkimwl7/image/upload/v1742375634/categories-image/1742375634173_caa00436-689d-40b6-b63c-310dbc3a6c3b.jpg",
    "name": "Amos Greenholt",
    "slug": "amos-greenholt",
    "status": "inactive",
    "level": 1,
    "createdAt": "2025-03-19T09:13:57.342Z",
    "updatedAt": "2025-03-19T09:51:10.182Z"
  }
}
```

### Structure Data Response

| Field     | Nullable | Type   | Description       |
| --------- | -------- | ------ | ----------------- |
| id        |          | String | Category Id       |
| image     |          | String | Category image    |
| name      |          | String | Category name     |
| slug      |          | String | Slug              |
| status    |          | String | Status            |
| level     |          | Number | Level of category |
| createdAt |          | String | Created at        |
| updatedAt |          | String | Updated at        |

### Category Is Inactive (400)

```json
{
  "code": 400,
  "codeMessage": "BAD_REQUEST",
  "message": "Category is inactive",
  "timestamp": 1742377709588,
  "data": null
}
```

### Category Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Category not found",
  "timestamp": 1742233236196,
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
