const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('[db] No MONGODB_URI set. Running without persistence.');
    return null;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[db] MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    console.warn('[db] Continuing without persistence. Save endpoints will return 503.');
    return null;
  }
}

function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isConnected };
