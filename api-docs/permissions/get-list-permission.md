## API Get List Permission

This endpoint is used to retrieve a list of permissions based on the provided keyword, limit, and page parameters.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/permissions/get-permissions
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/permissions/get-permissions
```

#### Curl

```bash
curl --request GET 'https://server-clothes-store.vercel.app/api/permissions/get-permissions' \
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
  "message": "Get all permissions successfully",
  "timestamp": 1742289879961,
  "data": {
    "meta": {
      "page": 1,
      "limit": 10,
      "totalCount": 1,
      "offset": 0,
      "totalPage": 1,
      "isNext": false,
      "isPrevious": false,
      "isFirst": false,
      "isLast": false
    },
    "list": [
      {
        "id": "67d93a54d62edb1e2e85a1b8",
        "name": "show:category",
        "description": "Show category",
        "module": "categories",
        "createdAt": "2025-03-18T09:18:12.981Z",
        "updatedAt": "2025-03-18T09:18:12.981Z"
      }
    ]
  }
}
```

### Structure Data Response

| Field       | Nullable | Type    | Description          |
| ----------- | -------- | ------- | -------------------- |
| meta        |          | Object  | Meta                 |
| page        |          | Number  | Current page         |
| limit       |          | Number  | Limit per page       |
| totalCount  |          | Number  | Total count          |
| offset      |          | Number  | Skip                 |
| totalPage   |          | Number  | Total page           |
| isNext      |          | Boolean | Is next              |
| isPrevious  |          | Boolean | Is previous          |
| isFirst     |          | Boolean | Is first             |
| isLast      |          | Boolean | Is last              |
| list        |          | Array   | Array of permissions |
| id          |          | String  | Permission ID        |
| name        |          | String  | Permission name      |
| description |          | String  | Description          |
| module      |          | String  | Module               |
| createdAt   |          | String  | Created At           |
| updatedAt   |          | String  | Updated At           |

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
