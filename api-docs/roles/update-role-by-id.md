## API Update Role By ID

This endpoint is used to update a role by its ID.

[PATCH](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/roles/update-role-by-id/:roleId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/roles/update-role-by-id/:roleId
```

#### Curl

```bash
curl --request PATCH 'https://server-clothes-store.vercel.app/api/roles/update-role-by-id/67d7e61b5114396a4af8b95d' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--data-raw '{
    "name": "example",
    "description": "This is example",
    "status": "active"
}'
```

### Parameter

| Param       | Require | Path   | Type    | Description                            |
| ----------- | ------- | ------ | ------- | -------------------------------------- |
| token       | x       | header | String  | Token                                  |
| roleId      | x       | params | String  | Role ID                                |
| name        |        | body   | String  | Role name                              |
| description |        | body   | String  | Description                            |
| status      |        | body   | Boolean | Status<br>Enum: ["active", "inactive"] |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Update role successfully",
  "timestamp": 1742232606628,
  "data": {
    "id": "67d85c19284c7c3933f9823f",
    "name": "example",
    "slug": "example",
    "status": "active",
    "description": "This is example",
    "createdAt": "2025-03-17T17:30:01.529Z",
    "updatedAt": "2025-03-17T17:30:06.621Z"
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

### INVALID_DATA (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742232429842,
  "data": [
    {
      "path": "name",
      "message": "\"name\" is required"
    },
    {
      "path": "description",
      "message": "\"description\" is required"
    },
    {
      "path": "status",
      "message": "\"status\" is required"
    }
  ]
}
```

### Role Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Role not found",
  "timestamp": 1742213487548,
  "data": null
}
```

### Role Name Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Role name already exists",
  "timestamp": 1742232644800,
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
