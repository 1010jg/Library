// Utility functions สำหรับระบบ Backend

/**
 * แปลง Date เป็น dd/mm/yyyy (พ.ศ.)
 * @param {Date} d 
 * @returns {string} วันที่ในรูปแบบ dd/mm/yyyy (พ.ศ.)
 */
function formatDateThai(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

/**
 * สร้าง ID ใหม่จาก array (แบบเดิม)
 * @param {Array} list รายการข้อมูลเดิม
 * @param {string} prefix ตัวนำหน้ารหัส เช่น 'BK', 'MB', 'BR', 'FN', 'ST'
 * @returns {string} รหัส ID ใหม่
 */
function nextId(list, prefix) {
  return `${prefix}-${String((list?.length || 0) + 1).padStart(3, "0")}`;
}

/**
 * สร้าง ID ใหม่โดยค้นหาเลขสูงสุดจาก Mongoose Model
 * @param {import('mongoose').Model} Model โมเดล Mongoose
 * @param {string} prefix ตัวนำหน้ารหัส เช่น 'BK', 'MB', 'BR', 'FN', 'ST'
 * @returns {Promise<string>} รหัส ID ใหม่
 */
async function generateNextId(Model, prefix) {
  const items = await Model.find({}, "id").lean();
  let maxNum = 0;
  for (const item of items) {
    if (item.id && item.id.startsWith(prefix + "-")) {
      const num = parseInt(item.id.replace(prefix + "-", ""), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
}

module.exports = {
  formatDateThai,
  nextId,
  generateNextId
};
