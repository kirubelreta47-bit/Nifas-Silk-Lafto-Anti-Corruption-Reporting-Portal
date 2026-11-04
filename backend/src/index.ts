import { createServer } from './server.js';
import { config } from './config/index.js';
import { initDatabase } from './db/index.js';

const app = createServer();

const start = async () => {
  // Initialize Database connection and auto-migration
  await initDatabase();

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 NSL Anti-Corruption API Server running on port ${config.port}`);
    console.log(`🌐 Local Health Check: http://localhost:${config.port}/health`);
    console.log(`📁 Allowed CORS Origins: ${config.corsOrigins.join(', ')}`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('Stopping server gracefully...');
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

