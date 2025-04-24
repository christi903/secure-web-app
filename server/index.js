const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
//const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Trust proxy headers when behind a reverse proxy
app.set('trust proxy', true);


// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});