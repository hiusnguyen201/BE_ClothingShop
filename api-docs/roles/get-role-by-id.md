## API Get Role By ID

This endpoint is used to retrieve a specific role by its ID.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/roles/get-role-by-id/:roleId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/roles/get-role-by-id/:roleId
```

#### Curl

```bash
curl --request GET 'https://server-clothes-store.vercel.app/api/roles/get-role-by-id/67d7e61b5114396a4af8b95d' \
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
  "message": "Get one role successfully",
  "timestamp": 1742213340286,
  "data": {
    "id": "67d810ac54e327ba6b329e19",
    "name": "exampl4e232333343",
    "slug": "exampl4e232333343",
    "status": "Active",
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
| status      |          | String | Status      |
| description |          | String | Description |
| createdAt   |          | String | Created At  |
| updatedAt   |          | String | Updated At  |

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
