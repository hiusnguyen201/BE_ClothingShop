export const apps = [
  {
    name: 'clothing-store',
    script: './src/server.js',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
      // Thêm các biến môi trường khác nếu cần
    },
    env_file: '.env.production', // Chỉ định file môi trường
  },
];
