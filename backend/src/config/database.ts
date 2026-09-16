import mongoose from 'mongoose';

// Add authSource=admin if using Railway MongoDB with root credentials
const rawUri = (process.env.MONGODB_URI || 'mongodb://localhost:27017/sonotrade').trim();
const MONGODB_URI = rawUri.includes('railway.internal') && !rawUri.includes('authSource')
  ? `${rawUri}${rawUri.includes('?') ? '&' : '?'}authSource=admin`
  : rawUri;

export const connectDB = async (): Promise<void> => {
  try {
    // Set connection timeout options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    };

    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Make sure MongoDB is running. Start it with:');
    console.error('   - Docker: cd backend && docker-compose up -d');
    console.error('   - Local: mongod (or brew services start mongodb-community)');
    // Don't exit - let the server start without MongoDB
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

