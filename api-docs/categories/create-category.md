## API Create Category

This endpoint is used to create a new category by submitting data to the specified API endpoint.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/categories/create-category
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/categories/create-category
```

#### Curl

```bash
curl -X POST 'https://server-clothes-store.vercel.app/api/categories/create-category' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--form "image=@/path/to/file.png"
--form "name=example" \
```

### Parameter

| Param    | Require | Path   | Type   | Description        |
| -------- | ------- | ------ | ------ | ------------------ |
| token    | x       | header | String | Token              |
| image    | x       | form   | String | Category image     |
| name     | x       | form   | String | Category name      |
| parentId |         | form   | String | Category parent ID |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Create category successfully",
  "timestamp": 1742372000464,
  "data": {
    "id": "67da7ca096ff86fc1e010fbb",
    "image": "http://res.cloudinary.com/dsfkimwl7/image/upload/742371998/categories-image/1742371995833_5ddb7278-cc9b-421d-ad72-dc22965708d7.jpg",
    "name": "Mr. Merle Keebler",
    "slug": "mr.-merle-keebler",
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

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742298322199,
  "data": [
    {
      "path": "image",
      "message": "\"image\" is required"
    },
    {
      "path": "name",
      "message": "\"name\" is required"
    }
  ]
}
```

### Parent Category Is Reach Limit (400)

```json
{
  "code": 400,
  "codeMessage": "BAD_REQUEST",
  "message": "Parent category has a maximum 2 levels only",
  "timestamp": 1742310091767,
  "data": null
}
```

### Parent category not found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Parent category not found",
  "timestamp": 1742310091767,
  "data": null
}
```

### Category Name Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Category name already exists",
  "timestamp": 1742310091767,
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
