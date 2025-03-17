## API Check Exist Role Name

This endpoint is used to check if a role name already exists.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/v1/roles/is-exist-role-name
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/v1/roles/is-exist-role-name
```

#### Curl

```bash
curl --location --request POST 'https://server-clothes-store.vercel.app/api/v1/roles/is-exist-role-name' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "example",
}'
```

### Parameter

| Param | Require | Path | Type   | Description |
| ----- | ------- | ---- | ------ | ----------- |
| name  | x       | body | String | Role name   |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Role name does not exist",
  "timestamp": 1742201662104,
  "data": false
}
```

### Structure Data Response

| Field | Nullable | Type    | Description    |
| ----- | -------- | ------- | -------------- |
| data  |          | Boolean | Is exist email |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742201621988,
  "data": [
    {
      "path": "name",
      "message": "\"name\" is required"
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
