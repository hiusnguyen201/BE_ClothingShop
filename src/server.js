import app from '#src/app';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
// import {createServer} from 'https';

let options = null;

// options = {
// key: fs.readFileSync(path.join(process.cwd(), 'certificates', 'key.pem')),
// cert: fs.readFileSync(path.join(process.cwd(), 'certificates', 'cert.pem')),
// };

const HOST = 'localhost';
const PORT = options ? parseInt(process.env.PORT, 10) || 3443 : 3000;
const protocol = options ? 'https' : 'http';

const serverApi = createServer(app);

serverApi.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
    ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗     ███████╗████████╗ █████╗ ██████╗ ████████╗      
    ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝      
    ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝    ███████╗   ██║   ███████║██████╔╝   ██║         
    ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗    ╚════██║   ██║   ██╔══██║██╔══██╗   ██║         
    ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║    ███████║   ██║   ██║  ██║██║  ██║   ██║██╗██╗██╗
    ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝╚═╝╚═╝╚═╝
    `);
    console.log(`🌍 Server is running on: ${protocol}://${HOST}:${PORT} 🌍`);
  }
});
