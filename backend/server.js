const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Utility: แปลง Date เป็น dd/mm/yyyy (พ.ศ.) เหมือนฝั่งหน้าบ้านเดิม
function formatDateThai(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

function nextId(list, prefix) {
  return `${prefix}-${String(list.length + 1).padStart(3, "0")}`;
}

/* ------------------------------------------------------------------ */
/* AUTH                                                                */
/* ------------------------------------------------------------------ */

// ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่ในปัจจุบัน
app.get("/api/auth/me", (req, res) => {
  const data = db.load();
  if (data.currentUser && data.staff) {
    const matched = data.staff.find((s) => s.email.toLowerCase() === data.currentUser.email?.toLowerCase());
    if (matched) {
      data.currentUser.role = matched.role;
    }
  }
  res.json({ user: data.currentUser });
});

// เข้าสู่ระบบด้วยอีเมลบุคลากร (สำหรับผู้ดูแลระบบหรือบรรณารักษ์เดิม)
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "กรุณาระบุอีเมล" });

  const cleanEmail = email.trim().toLowerCase();
  const data = db.load();
  data.staff = data.staff || [];

  let found = data.staff.find((s) => s.email.toLowerCase() === cleanEmail);

  // ถ้าพิมพ์ admin หรือ admin@library.com ให้เข้าสู่บัญชีผู้ดูแลระบบหลักทันที
  if (!found && (cleanEmail === "admin" || cleanEmail === "admin@library.com" || cleanEmail === "admin@gmail.com")) {
    found = data.staff.find((s) => s.role === "ผู้ดูแลระบบ");
  }

  if (!found) {
    return res.status(404).json({ error: "ไม่พบบัญชีผู้ใช้นี้ในระบบบุคลากร กรุณาลงทะเบียนบรรณารักษ์ก่อน" });
  }

  data.currentUser = {
    name: found.name,
    email: found.email,
    role: found.role,
    registeredAt: found.registeredAt
  };
  db.save(data);
  res.json({ user: data.currentUser });
});

// ลงทะเบียนผู้ใช้ / บรรณารักษ์ใหม่ (สมัครได้เฉพาะบทบาทบรรณารักษ์เท่านั้น)
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "กรุณาระบุชื่อและอีเมล" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "").slice(0, 10) : "-";
  const data = db.load();
  data.staff = data.staff || [];

  // ตรวจสอบว่ามีอีเมลนี้อยู่แล้วหรือไม่
  const staffExists = data.staff.find((s) => s.email.toLowerCase() === cleanEmail);
  if (staffExists) {
    return res.status(400).json({ error: "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาไปที่แท็บ 'เข้าสู่ระบบ (ผู้ดูแลระบบ / เดิม)' เพื่อเข้าใช้งาน" });
  }

  // สมัครใหม่ได้เฉพาะสิทธิ์ "บรรณารักษ์" เท่านั้น (มีผู้ดูแลระบบได้แค่ 1 บัญชี)
  const assignedRole = "บรรณารักษ์";
  const user = { name: name.trim(), email: cleanEmail, role: assignedRole, registeredAt: new Date().toISOString() };
  data.currentUser = user;

  data.staff.push({
    id: nextId(data.staff, "ST"),
    name: name.trim(),
    email: cleanEmail,
    role: assignedRole,
    phone: cleanPhone || "-",
    registeredAt: formatDateThai(new Date())
  });

  db.save(data);
  res.json({ user });
});

// ออกจากระบบ
app.post("/api/auth/logout", (req, res) => {
  const data = db.load();
  data.currentUser = null;
  db.save(data);
  res.json({ ok: true });
});

// แก้ไขข้อมูลโปรไฟล์ผู้ใช้งาน (หน้า ตั้งค่า)
app.put("/api/auth/profile", (req, res) => {
  const { name } = req.body;
  const data = db.load();
  if (!data.currentUser) return res.status(401).json({ error: "ยังไม่ได้เข้าสู่ระบบ" });

  data.staff = data.staff || [];
  data.currentUser = { ...data.currentUser, name: name ? name.trim() : data.currentUser.name };

  // อัปเดตใน staff list ด้วย
  const staffMember = data.staff.find((s) => s.email.toLowerCase() === data.currentUser.email.toLowerCase());
  if (staffMember) {
    staffMember.name = data.currentUser.name;
  }

  db.save(data);
  res.json({ user: data.currentUser });
});

/* ------------------------------------------------------------------ */
/* STAFF / LIBRARIANS (ผู้ดูแลระบบจัดการ)                             */
/* ------------------------------------------------------------------ */

app.get("/api/staff", (req, res) => {
  const data = db.load();
  data.staff = data.staff || [];
  res.json(data.staff);
});

app.post("/api/staff", (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: "กรุณาระบุชื่อและอีเมล" });

  const cleanEmail = email.trim().toLowerCase();
  const data = db.load();
  data.staff = data.staff || [];

  const exists = data.staff.some((s) => s.email.toLowerCase() === cleanEmail);
  if (exists) return res.status(400).json({ error: "อีเมลนี้มีอยู่ในระบบบุคลากรแล้ว กรุณาใช้อีเมลอื่น" });

  // เพิ่มใหม่ได้เฉพาะบทบาท "บรรณารักษ์" เท่านั้น
  const newStaff = {
    id: nextId(data.staff, "ST"),
    name: name.trim(),
    email: cleanEmail,
    role: "บรรณารักษ์",
    phone: phone ? phone.trim() : "-",
    registeredAt: formatDateThai(new Date())
  };
  data.staff.push(newStaff);
  db.save(data);
  res.status(201).json(newStaff);
});

app.put("/api/staff/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const data = db.load();
  data.staff = data.staff || [];

  const idx = data.staff.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบบุคลากรนี้" });

  const staff = data.staff[idx];
  const cleanEmail = email ? email.trim().toLowerCase() : staff.email;

  // ตรวจสอบอีเมลซ้ำกับบุคลากรคนอื่น
  const emailDuplicate = data.staff.some((s) => s.id !== id && s.email.toLowerCase() === cleanEmail);
  if (emailDuplicate) {
    return res.status(400).json({ error: "อีเมลนี้มีบุคลากรท่านอื่นใช้งานอยู่แล้ว" });
  }

  data.staff[idx] = {
    ...staff,
    name: name ? name.trim() : staff.name,
    email: cleanEmail,
    phone: phone ? phone.trim() : staff.phone
  };

  // ถ้าแก้ข้อมูลของคนที่ล็อกอินอยู่ ให้ sync currentUser ด้วย
  if (data.currentUser && (data.currentUser.email.toLowerCase() === staff.email.toLowerCase() || data.currentUser.email.toLowerCase() === cleanEmail)) {
    data.currentUser.name = data.staff[idx].name;
    data.currentUser.email = data.staff[idx].email;
  }

  db.save(data);
  res.json(data.staff[idx]);
});

app.delete("/api/staff/:id", (req, res) => {
  const { id } = req.params;
  const data = db.load();
  data.staff = data.staff || [];

  const target = data.staff.find((s) => s.id === id);
  if (!target) return res.status(404).json({ error: "ไม่พบบุคลากรนี้" });

  // ป้องกันการลบบัญชีผู้ดูแลระบบ
  if (target.role === "ผู้ดูแลระบบ") {
    return res.status(400).json({ error: "ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้" });
  }

  data.staff = data.staff.filter((s) => s.id !== id);
  db.save(data);
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* BOOKS                                                               */
/* ------------------------------------------------------------------ */

app.get("/api/books", (req, res) => {
  res.json(db.load().books);
});

app.post("/api/books", (req, res) => {
  const { title, author, category, isbn, total } = req.body;
  if (!title || !author) return res.status(400).json({ error: "กรุณาระบุชื่อหนังสือและผู้แต่ง" });

  const data = db.load();
  const qty = parseInt(total) || 1;
  const newBook = {
    id: nextId(data.books, "BK"),
    title,
    author,
    category: category || "คอมพิวเตอร์",
    isbn: isbn || "-",
    total: qty,
    available: qty
  };
  data.books.push(newBook);
  db.save(data);
  res.status(201).json(newBook);
});

app.put("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, category, isbn, total } = req.body;
  const data = db.load();
  const idx = data.books.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบหนังสือ" });

  const book = data.books[idx];
  const newTotal = parseInt(total) || book.total;
  const diff = newTotal - book.total;
  const newAvailable = Math.max(0, book.available + diff);

  data.books[idx] = {
    ...book,
    title: title ?? book.title,
    author: author ?? book.author,
    category: category ?? book.category,
    isbn: isbn || "-",
    total: newTotal,
    available: newAvailable
  };
  db.save(data);
  res.json(data.books[idx]);
});

app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const data = db.load();
  data.books = data.books.filter((b) => b.id !== id);
  db.save(data);
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* MEMBERS                                                             */
/* ------------------------------------------------------------------ */

app.get("/api/members", (req, res) => {
  res.json(db.load().members);
});

app.post("/api/members", (req, res) => {
  const { name, phone, email, status } = req.body;
  if (!name) return res.status(400).json({ error: "กรุณาระบุชื่อสมาชิก" });

  const data = db.load();
  const cleanEmail = email ? email.trim().toLowerCase() : "-";

  // ตรวจสอบอีเมลซ้ำในสมาชิก
  if (cleanEmail && cleanEmail !== "-") {
    const exists = data.members.some((m) => m.email && m.email.toLowerCase() === cleanEmail);
    if (exists) return res.status(400).json({ error: "อีเมลนี้มีสมาชิกท่านอื่นใช้งานอยู่แล้ว" });
  }

  const newMember = {
    id: nextId(data.members, "MB"),
    name: name.trim(),
    phone: phone ? phone.trim() : "-",
    email: cleanEmail,
    status: status || "active"
  };
  data.members.push(newMember);
  db.save(data);
  res.status(201).json(newMember);
});

app.put("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, email, status } = req.body;
  const data = db.load();
  const idx = data.members.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบสมาชิก" });

  const cleanEmail = email !== undefined ? (email ? email.trim().toLowerCase() : "-") : data.members[idx].email;

  // ตรวจสอบอีเมลซ้ำกับสมาชิกท่านอื่น
  if (cleanEmail && cleanEmail !== "-") {
    const exists = data.members.some((m) => m.id !== id && m.email && m.email.toLowerCase() === cleanEmail);
    if (exists) return res.status(400).json({ error: "อีเมลนี้มีสมาชิกท่านอื่นใช้งานอยู่แล้ว" });
  }

  data.members[idx] = {
    ...data.members[idx],
    name: name ? name.trim() : data.members[idx].name,
    phone: phone ? phone.trim() : data.members[idx].phone,
    email: cleanEmail,
    status: status ?? data.members[idx].status
  };
  db.save(data);
  res.json(data.members[idx]);
});

app.delete("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const data = db.load();
  data.members = data.members.filter((m) => m.id !== id);
  db.save(data);
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* BORROW / RETURN                                                     */
/* ------------------------------------------------------------------ */

app.get("/api/borrows", (req, res) => {
  res.json(db.load().borrows);
});

app.post("/api/borrows", (req, res) => {
  const { memberName, bookTitle, borrowDate, returnDate } = req.body;
  if (!memberName || !bookTitle) {
    return res.status(400).json({ error: "กรุณาเลือกสมาชิกและหนังสือ" });
  }

  const data = db.load();
  const bookIdx = data.books.findIndex((b) => b.title === bookTitle);
  if (bookIdx === -1 || data.books[bookIdx].available <= 0) {
    return res.status(400).json({ error: "หนังสือเล่มนี้ไม่มีคงเหลือให้ยืม" });
  }

  data.books[bookIdx] = { ...data.books[bookIdx], available: data.books[bookIdx].available - 1 };

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + (data.policy?.borrowDays || 14));

  const newBorrow = {
    id: nextId(data.borrows, "BR"),
    memberName,
    bookTitle,
    borrowDate: borrowDate || formatDateThai(today),
    returnDate: returnDate || formatDateThai(dueDate),
    status: "กำลังยืม"
  };
  data.borrows.push(newBorrow);
  db.save(data);
  res.status(201).json(newBorrow);
});

app.post("/api/borrows/:id/return", (req, res) => {
  const { id } = req.params;
  const data = db.load();
  const idx = data.borrows.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบรายการยืม" });

  const borrow = data.borrows[idx];
  data.borrows[idx] = { ...borrow, status: "คืนแล้ว" };

  const bookIdx = data.books.findIndex((b) => b.title === borrow.bookTitle);
  if (bookIdx !== -1) {
    const book = data.books[bookIdx];
    data.books[bookIdx] = { ...book, available: Math.min(book.total, book.available + 1) };
  }

  db.save(data);
  res.json(data.borrows[idx]);
});

/* ------------------------------------------------------------------ */
/* FINES                                                               */
/* ------------------------------------------------------------------ */

app.get("/api/fines", (req, res) => {
  res.json(db.load().fines);
});

app.post("/api/fines", (req, res) => {
  const { memberName, reason, amount } = req.body;
  if (!memberName) return res.status(400).json({ error: "กรุณาเลือกสมาชิก" });

  const data = db.load();
  const newFine = {
    id: nextId(data.fines, "FN"),
    memberName,
    reason: reason || "ส่งคืนหนังสือเกินกำหนด",
    amount: Number(amount) || 10,
    date: formatDateThai(new Date()),
    status: "ค้างชำระ"
  };
  data.fines.push(newFine);
  db.save(data);
  res.status(201).json(newFine);
});

app.post("/api/fines/:id/pay", (req, res) => {
  const { id } = req.params;
  const data = db.load();
  const idx = data.fines.findIndex((f) => f.id === id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบรายการค่าปรับ" });

  data.fines[idx] = { ...data.fines[idx], status: "ชำระแล้ว" };
  db.save(data);
  res.json(data.fines[idx]);
});

/* ------------------------------------------------------------------ */
/* POLICY (SETTINGS)                                                   */
/* ------------------------------------------------------------------ */

app.get("/api/policy", (req, res) => {
  res.json(db.load().policy);
});

app.put("/api/policy", (req, res) => {
  const { borrowDays, maxBooks, finePerDay } = req.body;
  const data = db.load();
  data.policy = {
    borrowDays: Number(borrowDays) || data.policy.borrowDays,
    maxBooks: Number(maxBooks) || data.policy.maxBooks,
    finePerDay: Number(finePerDay) || data.policy.finePerDay
  };
  db.save(data);
  res.json(data.policy);
});

/* ------------------------------------------------------------------ */
/* SYSTEM                                                              */
/* ------------------------------------------------------------------ */

app.post("/api/system/reset", (req, res) => {
  const fresh = db.reset();
  res.json(fresh);
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`📚 Library backend API running at http://localhost:${PORT}`);
});
