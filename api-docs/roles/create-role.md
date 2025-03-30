## API Create role

This endpoint is used to create a new role by submitting data to the specified API endpoint.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/roles/create-role
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/roles/create-role
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/roles/create-role' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--data-raw '{
    "name": "example",
    "description": "This is example"
}'
```

### Parameter

| Param       | Require | Path   | Type   | Description |
| ----------- | ------- | ------ | ------ | ----------- |
| token       | x       | header | String | Token       |
| name        | x       | body   | String | Role name   |
| description | x       | body   | String | Description |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Create role successfully",
  "timestamp": 1742202395238,
  "data": {
    "id": "67d810ac54e327ba6b329e19",
    "name": "exampl4e232333343",
    "slug": "exampl4e232333343",
    "description": "a",
    "createdAt": "2025-03-17T12:08:12.097Z",
    "updatedAt": "2025-03-17T12:08:12.097Z"
  }
}
```

### Structure Data Response

| Field       | Nullable | Type   | Description |
| ----------- | -------- | ------ | ----------- |
| id          |          | String | Role Id     |
| name        |          | String | Role name   |
| slug        |          | String | Role slug   |
| description |          | String | Description |
| createdAt   |          | String | Created At  |
| updatedAt   |          | String | Updated At  |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742203378668,
  "data": [
    {
      "path": "name",
      "message": "\"name\" is required"
    },
    {
      "path": "description",
      "message": "\"description\" is required"
    }
  ]
}
```

### Role Name Already Exists (409)

```json
{
  "code": 409,
  "codeMessage": "ALREADY_EXISTS",
  "message": "Role name already exists",
  "timestamp": 1742202679471,
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
