import axios from "axios";

// เรียก API ผ่าน path "/api" ซึ่ง Vite dev server จะ proxy ไปยัง
// Node.js/Express backend ที่ http://localhost:4000 (ดู vite.config.js)
const http = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" }
});

export default http;
