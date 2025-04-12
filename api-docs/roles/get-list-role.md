## API Get List Role

This endpoint is used to retrieve a list of roles based on the provided keyword, limit, and page parameters.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/roles/get-roles
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/roles/get-roles
```

#### Curl

```bash
curl --request GET 'https://server-clothes-store.vercel.app/api/roles/get-roles' \
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
  "message": "Get all roles successful",
  "timestamp": 1742209827162,
  "data": {
    "totalCount": 1,
    "list": [
      {
        "id": "67d807baa32da40ffd946fa0",
        "name": "exampl4e2323333",
        "slug": "exampl4e2323333",
        "description": "a"
      }
    ]
  }
}
```

### Structure Data Response

| Field       | Nullable | Type   | Description    |
| ----------- | -------- | ------ | -------------- |
| data        |          | Object | Data response  |
| totalCount  |          | Number | Total count    |
| list        |          | Array  | Array of roles |
| id          |          | String | Role ID        |
| name        |          | String | Role name      |
| slug        |          | String | Role slug      |
| description |          | String | Description    |

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
