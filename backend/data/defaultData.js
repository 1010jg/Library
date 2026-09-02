// ข้อมูลเริ่มต้นของระบบ (ใช้ตอนเริ่มต้นครั้งแรก หรือตอนรีเซ็ตระบบ)
module.exports = {
  currentUser: null,
  policy: { borrowDays: 14, maxBooks: 5, finePerDay: 5 },
  staff: [
    { id: "ST-001", name: "ผู้ดูแลระบบห้องสมุด", email: "admin@library.com", role: "ผู้ดูแลระบบ", phone: "081-999-8888", registeredAt: "01/01/2568" },
    { id: "ST-002", name: "น.ส. บุษบา มาดี", email: "librarian1@library.com", role: "บรรณารักษ์", phone: "082-111-2222", registeredAt: "15/01/2568" },
    { id: "ST-003", name: "นายเกียรติศักดิ์ พิทักษ์", email: "librarian2@library.com", role: "บรรณารักษ์", phone: "083-222-3333", registeredAt: "01/02/2568" }
  ],
  books: [
    { id: "BK-001", title: "Harry Potter เล่ม 1", author: "J.K. Rowling", category: "วรรณกรรม", isbn: "978-616-04-0001", total: 5, available: 4 },
    { id: "BK-002", title: "คณิตศาสตร์ ม.4", author: "สสวท.", category: "วิทยาศาสตร์", isbn: "978-616-04-0002", total: 3, available: 2 },
    { id: "BK-003", title: "เรียนรู้ Python 3 ฉบับสมบูรณ์", author: "อรพิน ประวัติบริสุทธิ์", category: "คอมพิวเตอร์", isbn: "978-616-04-0003", total: 5, available: 5 },
    { id: "BK-004", title: "ฟิสิกส์พื้นฐาน", author: "ดร. สมเกียรติ", category: "วิทยาศาสตร์", isbn: "978-616-04-0004", total: 4, available: 3 },
    { id: "BK-005", title: "ภาษาอังกฤษเพื่อการสื่อสาร", author: "John Doe", category: "ภาษาศาสตร์", isbn: "978-616-04-0005", total: 2, available: 1 }
  ],
  members: [
    { id: "MB-001", name: "นายสมชาย ใจดี", phone: "081-234-5678", email: "somchai@gmail.com", status: "active" },
    { id: "MB-002", name: "น.ส. สุดา มีสุข", phone: "082-345-6789", email: "suda@gmail.com", status: "active" },
    { id: "MB-003", name: "นายวิชัย แสงทอง", phone: "083-456-7890", email: "wichai@gmail.com", status: "active" },
    { id: "MB-004", name: "น.ส. มาลี รักดี", phone: "084-567-8901", email: "malee@gmail.com", status: "active" },
    { id: "MB-005", name: "นายประทีป ชูชาติ", phone: "085-678-9012", email: "prateep@gmail.com", status: "active" }
  ],
  borrows: [
    { id: "BR-001", memberName: "นายสมชาย ใจดี", bookTitle: "Harry Potter เล่ม 1", borrowDate: "01/08/2568", returnDate: "15/08/2568", status: "กำลังยืม" },
    { id: "BR-002", memberName: "น.ส. สุดา มีสุข", bookTitle: "คณิตศาสตร์ ม.4", borrowDate: "02/08/2568", returnDate: "16/08/2568", status: "กำลังยืม" },
    { id: "BR-003", memberName: "นายวิชัย แสงทอง", bookTitle: "ฟิสิกส์พื้นฐาน", borrowDate: "03/08/2568", returnDate: "17/08/2568", status: "กำลังยืม" },
    { id: "BR-004", memberName: "น.ส. มาลี รักดี", bookTitle: "ภาษาอังกฤษเพื่อการสื่อสาร", borrowDate: "20/07/2568", returnDate: "05/08/2568", status: "เกินกำหนด" },
    { id: "BR-005", memberName: "นายประทีป ชูชาติ", bookTitle: "เรียนรู้ Python 3 ฉบับสมบูรณ์", borrowDate: "25/07/2568", returnDate: "08/08/2568", status: "คืนแล้ว" }
  ],
  fines: [
    { id: "FN-001", memberName: "นายสมชาย ใจดี", reason: "ส่งคืนหนังสือเกินกำหนด (2 วัน)", amount: 10, date: "28/08/2569", status: "ค้างชำระ" },
    { id: "FN-002", memberName: "น.ส. สุดา มีสุข", reason: "หนังสือชำรุดเสียหายเล็กน้อย", amount: 50, date: "25/08/2569", status: "ชำระแล้ว" }
  ]
};
