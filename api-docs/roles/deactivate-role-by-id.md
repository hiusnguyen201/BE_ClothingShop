## API Deactivate Role By Id

This endpoint is used to update a role by its ID.

[PATCH](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/roles/deactivate-role-by-id/:roleId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/roles/deactivate-role-by-id/:roleId
```

#### Curl

```bash
curl --request PATCH 'https://server-clothes-store.vercel.app/api/roles/deactivate-role-by-id/67d7e61b5114396a4af8b95d' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
```

### Parameter

| Param  | Require | Path   | Type   | Description |
| ------ | ------- | ------ | ------ | ----------- |
| token  | x       | header | String | Token       |
| roleId | x       | params | String | Role ID     |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Deactivate role successfully",
  "timestamp": 1742233837958,
  "data": {
    "id": "67d8601d77454b6e7ba9e19c",
    "name": "exampl4e2323333243",
    "slug": "exampl4e2323333243",
    "status": "inactive",
    "description": "a",
    "createdAt": "2025-03-17T17:47:09.719Z",
    "updatedAt": "2025-03-17T17:50:37.952Z"
  }
}
```

### Structure Data Response

| Field       | Nullable | Type   | Description |
| ----------- | -------- | ------ | ----------- |
| id          |          | String | Role Id     |
| name        |          | String | Role name   |
| slug        |          | String | Role slug   |
| status      |          | String | Status      |
| description |          | String | Description |
| createdAt   |          | String | Created At  |
| updatedAt   |          | String | Updated At  |

### Role Is Inactive (400)

```json
{
  "code": 404,
  "codeMessage": "BAD_REQUEST",
  "message": "Role is inactive",
  "timestamp": 1742233236196,
  "data": null
}
```

### Role Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Role not found",
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
