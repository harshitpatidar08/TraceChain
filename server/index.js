import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

import productsRouter from './routes/products.js';
import eventsRouter from './routes/events.js';
import alertsRouter from './routes/alerts.js';
import chatbotRouter from './routes/chatbot.js';
import { runRiskDetection } from './services/aiRiskService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/chatbot', chatbotRouter);

app.get("/", (req, res) => {
  res.send("TraceChain API is running");
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
