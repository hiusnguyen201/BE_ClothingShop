## API Get List Category

This endpoint is used to retrieve a list of categories based on the provided keyword, limit, and page parameters.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/categories/get-categories
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/categories/get-categories
```

#### Curl

```bash
curl --request GET 'https://server-clothes-store.vercel.app/api/categories/get-categories' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
```

### Parameter

| Param     | Require | Path   | Type   | Description                                                  |
| --------- | ------- | ------ | ------ | ------------------------------------------------------------ |
| token     | x       | header | String | Token                                                        |
| keyword   |         | query  | String | Keyword                                                      |
| page      |         | query  | Number | Page<br>Default: 1                                           |
| limit     |         | query  | Number | Limit<br>Default: 10                                         |
| sortBy    |         | query  | String | Sort by<br>Enum: ["name", "createdAt"]<br>Default: createdAt |
| sortOrder |         | query  | String | Sort order<br>Enum: ["asc", "desc"]<br>Default: desc         |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Get all categories successfully",
  "timestamp": 1742373058243,
  "data": {
    "totalCount": 1,
    "list": [
      {
        "id": "67da7fa684daebe31786e7c9",
        "image": "http://res.cloudinary.com/dsfkimwl7/image/upload/742372772/categories-image/1742372771698_e4e47241-1ae2-4529-b2d2-8e17bc5eac93.jpg",
        "name": "Howard Corwin",
        "slug": "howard-corwin",
        "level": 1,
        "createdAt": "2025-03-19T08:26:14.441Z",
        "updatedAt": "2025-03-19T08:26:14.441Z"
      }
    ]
  }
}
```

### Structure Data Response

| Field      | Nullable | Type   | Description         |
| ---------- | -------- | ------ | ------------------- |
| data       |          | Object | Data response       |
| totalCount |          | Number | Total count         |
| list       |          | Array  | Array of categories |
| id         |          | String | Category ID         |
| image      |          | String | Category image      |
| name       |          | String | Category name       |
| slug       |          | String | Slug                |
| level      |          | String | Level of category   |
| createdAt  |          | String | Created at          |
| updatedAt  |          | String | Updated at          |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742213034072,
  "data": [
    {
      "path": "page",
      "message": "\"page\" must be a number"
    },
    {
      "path": "limit",
      "message": "\"limit\" must be a number"
    },
    {
      "path": "sortBy",
      "message": "\"sortBy\" must be one of [name, createdAt]"
    },
    {
      "path": "sortOrder",
      "message": "\"sortOrder\" must be one of [asc, desc]"
    }
  ]
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
