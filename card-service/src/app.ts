import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/database';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Card Service!' });
});

// Health check endpoint that verifies database connection
app.get('/health', async (req, res) => {
  try {
    // Try to ping the database
    await AppDataSource.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection initialized');
    
    // Only start the server after DB connection is established
    app.listen(port, () => {
      console.log(`Card Service running on port ${port}`);
    });
  })
  .catch((error: any) => {
    console.error('Error initializing database:', error?.message || error);
    process.exit(1);
  }); 