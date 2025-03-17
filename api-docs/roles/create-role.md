## API Create role

This endpoint is used to create a new role by submitting data to the specified API endpoint.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/v1/roles/create-role
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/v1/roles/create-role
```

#### Curl

```bash
curl --location --request POST 'https://server-clothes-store.vercel.app/api/v1/roles/create-role' \
--header 'Content-Type: application/json' \
--header 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
--data-raw '{
    "name": "example",
    "isActive": true
}'
```

### Parameter

| Param       | Require | Path   | Type    | Description |
| ----------- | ------- | ------ | ------- | ----------- |
| token       | x       | header | String  | Token       |
| name        | x       | body   | String  | Role name   |
| description |         | body   | String  | Description |
| isActive    | x       | body   | Boolean | Status      |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Create role successfully",
  "timestamp": 1742202395238,
  "data": {
    "id": "67d7e61b5114396a4af8b95d",
    "name": "example2",
    "slug": "example2",
    "isActive": true,
    "createdAt": "2025-03-17T09:06:35.225Z",
    "updatedAt": "2025-03-17T09:06:35.225Z"
  }
}
```

### Structure Data Response

| Field     | Nullable | Type    | Description |
| --------- | -------- | ------- | ----------- |
| id        |          | String  | Role Id     |
| name      |          | String  | Role name   |
| slug      |          | String  | Role slug   |
| isActive  |          | Boolean | Role status |
| createdAt |          | String  | Created At  |
| updatedAt |          | String  | Updated At  |

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
      "path": "isActive",
      "message": "\"isActive\" is required"
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
