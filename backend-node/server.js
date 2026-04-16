require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Curalink Node Backend is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});