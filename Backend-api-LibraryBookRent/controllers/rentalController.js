const Rental = require('../models/Rental');
const Book = require('../models/Book');
const User = require('../models/User');

const createRental = async (req, res) => {
  try {
    const { bookId } = req.body;
    const renterId = req.user._id;

    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required.' });
    }

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book is not available for rent.' });
    }

    const borrower = await User.findById(renterId);
    if (!borrower) {
      return res.status(400).json({ message: 'Borrower not found.' });
    }

    const rental = await Rental.create({
      user: borrower._id,
      book: bookId,
    });

    book.availableCopies -= 1;
    await book.save();

    const populatedRental = await Rental.findById(rental._id)
      .populate('book')
      .populate('user', 'name email memberType phone');
    res.status(201).json(populatedRental);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating rental.' });
  }
};

const createGuestRental = async (req, res) => {
  try {
    const { bookId, guestId, name, email, phone } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required.' });
    }

    let borrower = null;
    if (guestId) {
      borrower = await User.findById(guestId);
      if (!borrower || borrower.memberType !== 'guest') {
        return res.status(400).json({ message: 'Guest borrower not found.' });
      }
    } else {
      if (!name) {
        return res.status(400).json({ message: 'Name is required for guest borrower.' });
      }

      const existingUser = email ? await User.findOne({ email: email.toLowerCase() }) : null;
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered.' });
      }

      borrower = await User.create({
        name,
        email: email ? email.toLowerCase() : undefined,
        phone: phone || '',
        memberType: 'guest',
      });
    }

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book is not available for rent.' });
    }

    const rental = await Rental.create({
      user: borrower._id,
      book: bookId,
    });

    book.availableCopies -= 1;
    await book.save();

    const populatedRental = await Rental.findById(rental._id)
      .populate('book')
      .populate('user', 'name email memberType phone');
    res.status(201).json(populatedRental);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating guest rental.' });
  }
};

const returnRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('book');
    if (!rental) {
      return res.status(404).json({ message: 'Rental record not found.' });
    }
    if (rental.status === 'returned') {
      return res.status(400).json({ message: 'Rental already returned.' });
    }

    rental.status = 'returned';
    rental.returnDate = new Date();
    await rental.save();

    const book = await Book.findById(rental.book._id);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json(rental);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while returning rental.' });
  }
};

const getUserRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user._id }).populate('book').sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching user rentals.' });
  }
};

const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find().populate('book').populate('user', 'name email').sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching rentals.' });
  }
};

module.exports = { 
  createRental, 
  createGuestRental, 
  returnRental, 
  getUserRentals, 
  getAllRentals 
};