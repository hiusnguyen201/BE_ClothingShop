## API View profile

This endpoint is used to retrieve the profile data for the account.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/account/view-profile
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/account/view-profile
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/account/view-profile' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDJhMzMyYzhhMjEzYjA1MDI4MzNjNiIsInR5cGUiOiJVc2VyIiwiaWF0IjoxNzQyMjAxMDU5LCJleHAiOjE3NDIyMDE5NTl9.gsqLAzSlJKDPU3D9gvKg_I42NJ3NhI2d5svf-MYywDo' \
```

### Parameter

| Param | Require | Path   | Type   | Description |
| ----- | ------- | ------ | ------ | ----------- |
| token | x       | header | String | Token       |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1742382096034,
  "data": {
    "id": "67da9e0595571fe606993042",
    "avatar": null,
    "name": "Willis Waters",
    "email": "Timmy_Nitzsche72@hotmail.com",
    "phone": "0912345657",
    "gender": "male",
    "verifiedAt": "2025-03-19T10:37:57.979Z"
  }
}
```

### Structure Data Response

| Field      | Nullable | Type    | Description   |
| ---------- | -------- | ------- | ------------- |
| id         |          | String  | Customer Id   |
| avatar     | x        | String  | Avatar        |
| name       |          | String  | Customer name |
| email      |          | String  | Email         |
| phone      |          | String  | Phone         |
| gender     |          | String  | Gender        |
| verifiedAt | x        | Boolean | Verified at   |

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
