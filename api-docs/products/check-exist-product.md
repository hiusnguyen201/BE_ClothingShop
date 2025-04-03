## API Check Exist Email

This endpoint is used to check if a product name already exists.

[POST](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/products/is-exist-product-name
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/products/is-exist-product-name
```

#### Curl

```bash
curl --request POST 'https://server-clothes-store.vercel.app/api/users/is-exist-product-name' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Product name 1",
}'
```

### Parameter

| Param | Require | Path | Type   | Description  |
| ----- | ------- | ---- | ------ | ------------ |
| name  | x       | body | String | Product name |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1742234976321,
  "data": false
}
```

### Structure Data Response

| Field | Nullable | Type    | Description           |
| ----- | -------- | ------- | --------------------- |
| data  |          | Boolean | Is exist product name |

### Invalid Data (400)

```json
{
  "code": 400,
  "codeMessage": "INVALID_DATA",
  "message": "Request validation error",
  "timestamp": 1742235046446,
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
