## API PING

This endpoint sends a GET request to the specified base URL to check the availability and responsiveness of the server.

[GET](#)

#### Production

```bash
https://server-clothes-store.vercel.app/api/ping
```

#### Test

```bash
https://server-clothes-store.vercel.app/api/ping
```

#### Curl

```bash
curl --location --request GET 'https://server-clothes-store.vercel.app/api/ping' \
--header 'Content-Type: application/json' \
```

### Success (200)

```json
"Hello world! PING 1"
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
