import axios from "axios";

// เรียก API ผ่าน path ที่กำหนดไว้ใน .env (ค่าเริ่มต้นคือ "/api" ซึ่ง Vite จะ proxy ไปยัง Backend)
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" }
});

export default http;
