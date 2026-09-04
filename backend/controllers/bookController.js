const { Book } = require("../models");
const { generateNextId } = require("../utils/helpers");

// ดึงรายการหนังสือทั้งหมดจาก MongoDB
async function getBooks(req, res) {
  try {
    const books = await Book.find().sort({ createdAt: 1 }).lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// เพิ่มหนังสือใหม่ลง MongoDB
async function addBook(req, res) {
  try {
    const { title, author, category, isbn, total } = req.body;
    if (!title || !author) return res.status(400).json({ error: "กรุณาระบุชื่อหนังสือและผู้แต่ง" });

    const qty = parseInt(total) || 1;
    const newId = await generateNextId(Book, "BK");

    const newBook = await Book.create({
      id: newId,
      title: title.trim(),
      author: author.trim(),
      category: category || "คอมพิวเตอร์",
      isbn: isbn ? isbn.trim() : "-",
      total: qty,
      available: qty
    });

    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// แก้ไขข้อมูลหนังสือใน MongoDB
async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const { title, author, category, isbn, total } = req.body;

    const book = await Book.findOne({ id });
    if (!book) return res.status(404).json({ error: "ไม่พบหนังสือ" });

    const newTotal = total !== undefined ? (parseInt(total) || book.total) : book.total;
    const diff = newTotal - book.total;
    const newAvailable = Math.max(0, book.available + diff);

    book.title = title !== undefined ? title.trim() : book.title;
    book.author = author !== undefined ? author.trim() : book.author;
    book.category = category !== undefined ? category : book.category;
    book.isbn = isbn !== undefined ? (isbn ? isbn.trim() : "-") : book.isbn;
    book.total = newTotal;
    book.available = newAvailable;

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ลบหนังสือออกจาก MongoDB
async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    await Book.findOneAndDelete({ id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getBooks,
  addBook,
  updateBook,
  deleteBook
};
