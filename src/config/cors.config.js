export const corsConfig = {
  origin: [
    'https://fe-admin-clothingshop.onrender.com',
    'https://fe-client-clothingshop-5fpx.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fe-client-clothingshop-ilvk.onrender.com',
    'http://localhost:8081',
  ],
  methods: 'GET,POST,PUT,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};
