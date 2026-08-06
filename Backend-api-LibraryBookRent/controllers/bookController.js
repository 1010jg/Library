const Book = require('../models/Book');

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching books.' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching the book.' });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, description, category, totalCopies, coverImageUrl } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required.' });
    }

    const book = await Book.create({
      author,
      description,
      category,
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
      coverImageUrl,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating the book.' });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const { title, author, description, category, availableCopies, totalCopies, coverImageUrl } = req.body;

    book.title = title ?? book.title;
    book.author = author ?? book.author;
    book.description = description ?? book.description;
    book.category = category ?? book.category;
    book.coverImageUrl = coverImageUrl ?? book.coverImageUrl;
    book.totalCopies = totalCopies != null ? totalCopies : book.totalCopies;
    book.availableCopies = availableCopies != null ? availableCopies : book.availableCopies;

    await book.save();
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating the book.' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    await book.remove();
    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting the book.' });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
