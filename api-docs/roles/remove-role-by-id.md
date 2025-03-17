## API Remove Role By ID

This endpoint is used to update a role by its ID.

[DELETE](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/v1/roles/remove-role-by-id/:roleId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/v1/roles/remove-role-by-id/:roleId
```

#### Curl

```bash
curl --location --request DELETE 'https://server-clothes-store.vercel.app/api/v1/roles/remove-role-by-id/67d7e61b5114396a4af8b95d' \
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
  "message": "Remove role successfully",
  "timestamp": 1742233049127,
  "data": null
}
```

### Role is activating (400)

```json
{
  "code": 400,
  "codeMessage": "BAD_REQUEST",
  "message": "Role is activating",
  "timestamp": 1742233014046,
  "data": null
}
```

### Role Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Role not found",
  "timestamp": 1742233056577,
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
