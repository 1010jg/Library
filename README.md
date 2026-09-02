# ระบบจัดการห้องสมุด (Library Management System)

โปรเจกต์นี้แปลงจากหน้าเว็บ 7 หน้า (HTML + Tailwind CDN + localStorage) เดิม
ให้กลายเป็นเว็บแอปพลิเคชันสมัยใหม่แบบ **Full-Stack / Client-Server Architecture**
แยกส่วนการทำงานออกเป็น 2 โฟลเดอร์หลักอย่างชัดเจน:

- **`frontend/`** — Vue.js 3 + Vite
- **`backend/`** — Node.js + Express

ข้อมูลทั้งหมด (หนังสือ, สมาชิก, รายการยืม-คืน, ค่าปรับ, ผู้ใช้งาน, นโยบายห้องสมุด)
จะถูกส่งเป็น **API Requests** จาก Frontend ไปประมวลผลและบันทึกที่ Backend
(เก็บลงไฟล์ `backend/data/db.json` แทนการใช้ `localStorage` ของเบราว์เซอร์แบบเดิม)

## โครงสร้างโปรเจกต์

```
library-project/
├── frontend/                  # Vue.js 3 + Vite frontend
│   ├── src/
│   │   ├── api/http.js        # axios client (เรียก /api/...)
│   │   ├── store/library.js   # Pinia store (state + actions เรียก API)
│   │   ├── router/index.js    # Vue Router (7 หน้า)
│   │   ├── constants/roles.js
│   │   ├── components/        # Sidebar, AppHeader, AppLayout, AuthModal
│   │   ├── views/              # Dashboard, Books, Members, BorrowReturn,
│   │   │                       # Fines, Reports, Settings
│   │   ├── assets/main.css    # Tailwind CSS
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html              # HTML entry ของ Vite
│   ├── vite.config.js          # ตั้งค่า Vite + proxy /api -> backend :4000
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── package-lock.json
│
├── backend/                    # Node.js + Express API server
│   ├── data/
│   │   ├── defaultData.js      # ข้อมูลเริ่มต้น (seed data)
│   │   └── db.json             # ไฟล์ฐานข้อมูล (สร้างอัตโนมัติตอนรันครั้งแรก)
│   ├── db.js                   # ตัวช่วยอ่าน/เขียนฐานข้อมูล
│   ├── server.js                # Express server + REST API routes
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## วิธีติดตั้งและรันโปรเจกต์

ต้องรัน **2 โปรเซสพร้อมกัน** (เปิด 2 terminal) จาก root ของโปรเจกต์ (`library-project/`):

### 1) รัน Backend (Node.js/Express) — พอร์ต 4000

```bash
cd backend
npm install
npm start
```

จะเห็นข้อความ `📚 Library backend API running at http://localhost:4000`

### 2) รัน Frontend (Vue.js/Vite) — พอร์ต 5173

เปิด terminal อีกหน้าต่าง แล้วรัน:

```bash
cd frontend
npm install
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` — Vite จะ proxy คำขอ `/api/*` ไปยัง
backend ที่พอร์ต 4000 ให้อัตโนมัติ (ตั้งค่าไว้ใน `frontend/vite.config.js`)

### Build สำหรับ Production

```bash
cd frontend
npm run build      # สร้างไฟล์ static ในโฟลเดอร์ frontend/dist/
npm run preview    # ดูตัวอย่างไฟล์ build
```

เมื่อ deploy จริง ให้รัน backend เป็น service แยก แล้วตั้งค่า reverse proxy
(เช่น Nginx) ให้ path `/api` ชี้ไปที่ backend, และ serve ไฟล์ static ใน
`frontend/dist/` สำหรับ frontend

## API Endpoints หลัก (Backend)

| Method | Endpoint                  | คำอธิบาย                         |
|--------|----------------------------|-----------------------------------|
| GET    | `/api/auth/me`             | ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่      |
| POST   | `/api/auth/register`       | ลงทะเบียน/เริ่มใช้งานระบบ         |
| POST   | `/api/auth/logout`         | ออกจากระบบ                        |
| PUT    | `/api/auth/profile`        | แก้ไขโปรไฟล์ผู้ใช้                |
| GET    | `/api/books`                | ดูรายการหนังสือทั้งหมด            |
| POST   | `/api/books`                | เพิ่มหนังสือ                      |
| PUT    | `/api/books/:id`            | แก้ไขหนังสือ                      |
| DELETE | `/api/books/:id`            | ลบหนังสือ                         |
| GET/POST/PUT/DELETE | `/api/members[/:id]` | จัดการสมาชิก                    |
| GET    | `/api/borrows`              | ดูรายการยืม-คืน                   |
| POST   | `/api/borrows`              | ทำรายการยืมหนังสือ                |
| POST   | `/api/borrows/:id/return`   | คืนหนังสือ                        |
| GET    | `/api/fines`                | ดูรายการค่าปรับ                   |
| POST   | `/api/fines`                | สร้างรายการค่าปรับ                |
| POST   | `/api/fines/:id/pay`        | รับชำระค่าปรับ                    |
| GET/PUT| `/api/policy`               | ดู/แก้ไขนโยบายห้องสมุด            |
| POST   | `/api/system/reset`         | รีเซ็ตฐานข้อมูลกลับเป็นค่าเริ่มต้น |

## หมายเหตุ

- ฐานข้อมูลฝั่งเซิร์ฟเวอร์ในตัวอย่างนี้ใช้ไฟล์ JSON (`backend/data/db.json`)
  เพื่อความง่ายในการรันสาธิต หากต้องการใช้งานจริงสามารถเปลี่ยนไปใช้ฐานข้อมูล
  เช่น MongoDB, PostgreSQL หรือ MySQL ได้โดยแก้เฉพาะไฟล์ `backend/db.js`
  และ `backend/server.js` โดยไม่ต้องแก้ฝั่ง Frontend
- ระบบยืนยันตัวตนเป็นแบบง่าย (single-session, ไม่มีรหัสผ่าน) ตามพฤติกรรมเดิม
  ของไฟล์ HTML ต้นฉบับที่ใช้ `localStorage` เก็บผู้ใช้ปัจจุบันเพียงคนเดียว
