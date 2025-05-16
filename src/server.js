import app from '#src/app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { corsConfig } from '#src/config/cors.config';

const PORT = process.env.PORT || 3000;

const serverApi = createServer(app);

const io = new Server(serverApi, {
  cors: corsConfig,
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

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
    console.log(`🌍 Server is running on: http://localhost:${PORT} 🌍`);
  }
});

export { io, serverApi };
