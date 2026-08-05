require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/rentals', rentalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Library Book Rent API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
