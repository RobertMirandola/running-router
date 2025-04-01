require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/dbConn');
const PORT = 3500;

// Connect to MongoDB
connectDB();

app.use(cors());

app.use(express.json());

app.use('/map', require('./routes/mapRoutes'))

mongoose.connection.once('connected', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})