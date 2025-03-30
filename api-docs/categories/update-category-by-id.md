## API Update Category By ID

This endpoint is used to update a category by its ID.

[PATCH](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/categories/update-category-by-id/:categoryId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/categories/update-category-by-id/:categoryId
```

#### Curl

```bash
curl -X PATCH 'https://server-clothes-store.vercel.app/api/categories/update-category-by-id/67d7e61b5114396a4af8b95d' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--form "image=@/path/to/file.png"
--form "name=example" \
```

### Parameter

| Param      | Require | Path   | Type   | Description    |
| ---------- | ------- | ------ | ------ | -------------- |
| token      | x       | header | String | Token          |
| categoryId | x       | params | String | Category ID    |
| image      |         | form   | String | Category image |
| name       |         | form   | String | Category name  |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Update category successfully",
  "timestamp": 1742377078834,
  "data": {
    "id": "67da86312d0dfdb03567ad28",
    "image": "http://res.cloudinary.com/dsfkimwl7/image/upload/v1742377076/categories-image/1742377073496_4eb3f9d3-fe29-42ee-868e-f532a1999ba1.jpg",
    "name": "Jody Buckridge",
    "slug": "jody-buckridge",
    "level": 1,
    "createdAt": "2025-03-19T08:54:09.088Z",
    "updatedAt": "2025-03-19T09:37:58.821Z"
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
| level     |          | Number | Level of category |
| createdAt |          | String | Created at        |
| updatedAt |          | String | Updated at        |

### Too Many Files (400)

```json
{
  "code": 400,
  "codeMessage": "TOO_MANY_FILES",
  "message": "Too many files! Only 1 file is allowed",
  "timestamp": 1742299918934,
  "data": null
}
```

### File Too Large (400)

```json
{
  "code": 400,
  "codeMessage": "FILE_TOO_LARGE",
  "message": "File too large! Maximum size is 1MB",
  "timestamp": 1742299773159,
  "data": null
}
```

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

### Category Name Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Category name already exists",
  "timestamp": 1742232644800,
  "data": null
}
```

### Invalid File Type (415)

```json
{
  "code": 415,
  "codeMessage": "BAD_FILE_TYPE",
  "message": "Invalid file type! Support [\"image/jpeg\",\"image/png\"]",
  "timestamp": 1742299710960,
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

### Upload Image Error (503)

```json
{
  "code": 503,
  "codeMessage": "FILE_STORAGE_ERROR",
  "message": "Upload image failed",
  "timestamp": 1742159809316,
  "data": null
}
```
