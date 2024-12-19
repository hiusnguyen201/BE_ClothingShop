import "dotenv/config";
import http from "http";
import path from "path";
import app from "#src/app";

const PORT = process.env.PORT || 3000;

export const __ROOT_DIRNAME = path.resolve();

const serverApi = http.createServer(app);
serverApi.listen(PORT, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`
    ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗     ███████╗████████╗ █████╗ ██████╗ ████████╗      
    ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝      
    ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝    ███████╗   ██║   ███████║██████╔╝   ██║         
    ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗    ╚════██║   ██║   ██╔══██║██╔══██╗   ██║         
    ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║    ███████║   ██║   ██║  ██║██║  ██║   ██║██╗██╗██╗
    ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝╚═╝╚═╝╚═╝
    `);
  }

  console.log(`Server is running on http://localhost:${PORT}`);
});
