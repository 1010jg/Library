const { Borrow, Book, Policy } = require("../models");
const { formatDateThai, generateNextId } = require("../utils/helpers");

// ดึงรายการยืม-คืนทั้งหมดจาก MongoDB
async function getBorrows(req, res) {
  try {
    const borrows = await Borrow.find().sort({ createdAt: 1 }).lean();
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ทำรายการยืมหนังสือใน MongoDB
async function createBorrow(req, res) {
  try {
    const { memberName, bookTitle, borrowDate, returnDate } = req.body;
    if (!memberName || !bookTitle) {
      return res.status(400).json({ error: "กรุณาเลือกสมาชิกและหนังสือ" });
    }

    const book = await Book.findOne({ title: bookTitle });
    if (!book || book.available <= 0) {
      return res.status(400).json({ error: "หนังสือเล่มนี้ไม่มีคงเหลือให้ยืม" });
    }

    // ตัดสต็อกหนังสือที่พร้อมให้ยืมลง 1 เล่ม
    book.available = Math.max(0, book.available - 1);
    await book.save();

    const policy = await Policy.findOne().lean();
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + (policy?.borrowDays || 14));

    const newId = await generateNextId(Borrow, "BR");
    const newBorrow = await Borrow.create({
      id: newId,
      memberName,
      bookTitle,
      borrowDate: borrowDate || formatDateThai(today),
      returnDate: returnDate || formatDateThai(dueDate),
      status: "กำลังยืม"
    });

    res.status(201).json(newBorrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// รับคืนหนังสือใน MongoDB
async function returnBook(req, res) {
  try {
    const { id } = req.params;
    const borrow = await Borrow.findOne({ id });
    if (!borrow) return res.status(404).json({ error: "ไม่พบรายการยืม" });

    borrow.status = "คืนแล้ว";
    await borrow.save();

    // คืนสต็อกหนังสือกลับเข้าสู่ชั้นหนังสือ
    const book = await Book.findOne({ title: borrow.bookTitle });
    if (book) {
      book.available = Math.min(book.total, book.available + 1);
      await book.save();
    }

    res.json(borrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getBorrows,
  createBorrow,
  returnBook
};
