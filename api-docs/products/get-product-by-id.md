## API Get User By ID

This endpoint is used to retrieve a specific product by its ID.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/products/get-product-by-id/:productId
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/products/get-product-by-id/:productId
```

#### Curl

```bash
curl --request GET 'https://server-clothes-store.vercel.app/api/users/get-user-by-id/67d7e61b5114396a4af8b95d' \
--header 'Content-Type: application/json' \
```

### Parameter

| Param     | Require | Path   | Type   | Description |
| --------- | ------- | ------ | ------ | ----------- |
| productId | x       | params | String | Product ID  |

### Success (200)

```json
{
  "code": 200,
  "codeMessage": "SUCCESS",
  "message": "Success",
  "timestamp": 1743274828304,
  "data": {
    "id": "67e81fef956727a0b7881bf1",
    "name": "Product 3202dce1",
    "slug": "product-3202dce1",
    "shortDescription": "abc",
    "content": "abc",
    "category": {
      "_id": "67e81b0f118aaea8a91006a8",
      "image": "http://res.cloudinary.com/dr9uologc/image/upload/v1743264528/categories-image/1743264524221_e1c7dac2-17cd-4698-afb1-eb01b04f17af.jpg",
      "name": "new new enw13131",
      "slug": "new-new-enw13131",
      "status": "active",
      "level": 1,
      "removedAt": null,
      "isRemoved": false,
      "removedBy": null,
      "createdAt": "2025-03-29T16:08:47.602Z",
      "updatedAt": "2025-03-29T16:08:47.602Z"
    },
    "productVariants": [
      {
        "_id": "67e81fef956727a0b7881bf2",
        "quantity": 1,
        "price": 2000,
        "sku": "sku1",
        "sold": 0,
        "product": "67e81fef956727a0b7881bf1",
        "variantValues": [
          {
            "option": {
              "_id": "67e8166aa1be49f9a2500320",
              "name": "Color",
              "createdAt": "2025-03-29T15:48:58.513Z",
              "updatedAt": "2025-03-29T15:48:58.752Z"
            },
            "optionValue": {
              "_id": "67e8166aa1be49f9a2500324",
              "valueName": "Red",
              "createdAt": "2025-03-29T15:48:58.635Z",
              "updatedAt": "2025-03-29T15:48:58.635Z"
            },
            "_id": "67e81ff0956727a0b7881bfe"
          },
          {
            "option": {
              "_id": "67e8166aa1be49f9a2500322",
              "name": "Size",
              "createdAt": "2025-03-29T15:48:58.520Z",
              "updatedAt": "2025-03-29T15:48:58.774Z"
            },
            "optionValue": {
              "_id": "67e8166aa1be49f9a2500329",
              "valueName": "M",
              "createdAt": "2025-03-29T15:48:58.647Z",
              "updatedAt": "2025-03-29T15:48:58.647Z"
            },
            "_id": "67e81ff0956727a0b7881bff"
          }
        ],
        "createdAt": "2025-03-29T16:29:36.189Z",
        "updatedAt": "2025-03-29T17:57:08.927Z",
        "productDiscount": {
          "_id": "67e834740a2e8215c084340e",
          "name": "discount 5",
          "amount": 1000,
          "isFixed": false,
          "startDate": "2025-03-29T17:57:08.442Z",
          "endDate": "2026-03-29T16:52:30.400Z",
          "removedAt": null,
          "createdAt": "2025-03-29T17:57:08.775Z",
          "updatedAt": "2025-03-29T17:57:08.775Z"
        }
      },
      {
        "_id": "67e81fef956727a0b7881bf3",
        "quantity": 2,
        "price": 2000,
        "sku": "sku2",
        "sold": 0,
        "product": "67e81fef956727a0b7881bf1",
        "variantValues": [
          {
            "option": {
              "_id": "67e8166aa1be49f9a2500320",
              "name": "Color",
              "createdAt": "2025-03-29T15:48:58.513Z",
              "updatedAt": "2025-03-29T15:48:58.752Z"
            },
            "optionValue": {
              "_id": "67e8166aa1be49f9a2500325",
              "valueName": "Green",
              "createdAt": "2025-03-29T15:48:58.635Z",
              "updatedAt": "2025-03-29T15:48:58.635Z"
            },
            "_id": "67e81fef956727a0b7881bfb"
          },
          {
            "option": {
              "_id": "67e8166aa1be49f9a2500322",
              "name": "Size",
              "createdAt": "2025-03-29T15:48:58.520Z",
              "updatedAt": "2025-03-29T15:48:58.774Z"
            },
            "optionValue": {
              "_id": "67e8166aa1be49f9a2500328",
              "valueName": "S",
              "createdAt": "2025-03-29T15:48:58.647Z",
              "updatedAt": "2025-03-29T15:48:58.647Z"
            },
            "_id": "67e81fef956727a0b7881bfc"
          }
        ],
        "createdAt": "2025-03-29T16:29:36.190Z",
        "updatedAt": "2025-03-29T16:29:36.190Z"
      }
    ],
    "createdAt": "2025-03-29T16:29:36.323Z",
    "updatedAt": "2025-03-29T16:29:36.323Z"
  }
}
```

### Structure Data Response

| Field            | Nullable | Type   | Description               |
| ---------------- | -------- | ------ | ------------------------- |
| id               |          | String | Product Id                |
| name             |          | String | Product name              |
| slug             |          | String | Product slug              |
| shortDescription |          | String | Proudct short description |
| content          |          | String | Product content           |
| category         |          | Object | Product category          |
| subCategory      | x        | Object | Product subCategory       |
| productVariants  |          | Array  | Product variants          |
| createdAt        |          | String | Created At                |
| updatedAt        |          | String | Updated At                |

### Product Not Found (404)

```json
{
  "code": 404,
  "codeMessage": "RESOURCE_NOT_FOUND",
  "message": "Product not found",
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
