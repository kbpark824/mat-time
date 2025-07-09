const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mat-time-production.up.railway.app'] // Your Railway domain
    : ['http://localhost:19006', 'http://localhost:8081', 'http://192.168.1.219:19006'], // Expo dev servers
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // Body parser for JSON

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/revenuecat', require('./routes/revenuecat'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));