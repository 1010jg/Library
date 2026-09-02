const fs = require("fs");
const path = require("path");
const defaultData = require("./data/defaultData");

const DB_FILE = path.join(__dirname, "data", "db.json");

// โหลดฐานข้อมูลจากไฟล์ db.json ถ้ายังไม่มีไฟล์ ให้สร้างจากค่าเริ่มต้น
function load() {
  if (!fs.existsSync(DB_FILE)) {
    save(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    save(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

// บันทึกฐานข้อมูลลงไฟล์ db.json (ทำหน้าที่เสมือนฐานข้อมูลฝั่งเซิร์ฟเวอร์)
function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function reset() {
  const fresh = JSON.parse(JSON.stringify(defaultData));
  save(fresh);
  return fresh;
}

module.exports = { load, save, reset };
