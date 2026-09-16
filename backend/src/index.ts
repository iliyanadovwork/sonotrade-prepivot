import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './config/database';
import apiRoutes from './routes/api';
import { setupWebSocketProxy } from './services/websocket-proxy';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sonotrade.io',
  'https://www.sonotrade.io',
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin)); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
  // Try to connect to MongoDB, but don't block server startup
  try {
    await connectDB();
  } catch (error) {
    console.warn('⚠️  Warning: MongoDB connection failed. Server will start without database.');
    console.warn('   Some endpoints that require database will not work.');
    console.warn('   To enable full functionality, start MongoDB:');
    console.warn('   - Docker: docker-compose up -d');
    console.warn('   - Local: brew services start mongodb-community');
  }

  // Create HTTP server and attach Express
  const server = http.createServer(app);

  // Setup WebSocket proxy
  setupWebSocketProxy(server);

  // Start server
  server.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket proxy available at ws://localhost:${PORT}/ws/orderbook`);
  });
};

startServer();
