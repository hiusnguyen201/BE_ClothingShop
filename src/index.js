import http from "http";
import app from "./app.js";
import config from "./config.js";

const serverHost = "localhost" || "127.0.0.1";
const serverPort = config.port;
const serverApi = http.createServer(app);

serverApi.listen(serverPort, () => {
  console.log(`Server running at http://${serverHost}:${serverPort}`);
});
