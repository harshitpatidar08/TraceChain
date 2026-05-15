import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.js';
import eventsRouter from './routes/events.js';
import alertsRouter from './routes/alerts.js';
import chatbotRouter from './routes/chatbot.js';
import { runRiskDetection } from './services/aiRiskService.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like same-origin or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (process.env.NODE_ENV === 'production') {
      // If FRONTEND_URL is not set, be permissive and allow all to prevent breaking the app
      if (!process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      if (origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    } else {
      // Development
      if (origin === 'http://localhost:5173') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/chatbot', chatbotRouter);

// 1. Serve static assets directly from the compiled frontend directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// 2. Express v5 compliant fallback middleware (No string wildcards)
app.use((req, res, next) => {
  // If the request is for an API endpoint that doesn't exist, pass it along
  if (req.url.startsWith('/api/')) {
    return next();
  }
  // Otherwise, send the frontend index file to handle routing
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Initialize node-cron
// Run aiRiskService every 30 minutes
cron.schedule('*/30 * * * *', () => {
  runRiskDetection();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
