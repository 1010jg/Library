require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const User = require('./models/User');
const Book = require('./models/Book');
const Rental = require('./models/Rental');

const app = express();

app.use(express.json());
app.use(cors());

connectDB().then(async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.insertMany([
      {
        name: 'Admin Library',
        email: 'admin@library.com',
        password: hashedPassword,
        memberType: 'registered',
        isAdmin: true,
      },
      {
        name: 'Somchai',
        email: 'somchai@library.com',
        password: hashedPassword,
        memberType: 'registered',
        isAdmin: false,
      },
      {
        name: 'Guest User',
        email: '',
        phone: '0812345678',
        memberType: 'guest',
      },
    ]);
    console.log('Seeded sample users');
  }

  const bookCount = await Book.countDocuments();
  if (bookCount === 0) {
    await Book.insertMany([
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        description: 'Adventure fantasy classic about Bilbo Baggins.',
        category: 'Fantasy',
        totalCopies: 3,
        availableCopies: 3,
        coverImageUrl: '',
      },
      {
        title: '1984',
        author: 'George Orwell',
        description: 'A dystopian novel about surveillance and control.',
        category: 'Classic',
        totalCopies: 2,
        availableCopies: 2,
        coverImageUrl: '',
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        description: 'A practical guide to building lasting habits.',
        category: 'Self-Help',
        totalCopies: 4,
        availableCopies: 4,
        coverImageUrl: '',
      },
    ]);
    console.log('Seeded sample books');
  }

  const rentalCount = await Rental.countDocuments();
  if (rentalCount === 0) {
    const users = await User.find();
    const books = await Book.find();
    if (users.length > 0 && books.length > 0) {
      await Rental.insertMany([
        {
          user: users[0]._id,
          book: books[0]._id,
          rentDate: new Date(),
          status: 'rented',
        },
        {
          user: users[1]._id,
          book: books[1]._id,
          rentDate: new Date(),
          status: 'returned',
          returnDate: new Date(),
        },
      ]);
      console.log('Seeded sample rentals');
    }
  }
});

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
