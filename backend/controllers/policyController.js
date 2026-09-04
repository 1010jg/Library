const { Policy } = require("../models");

// ดึงค่านโยบายห้องสมุดจาก MongoDB
async function getPolicy(req, res) {
  try {
    let policy = await Policy.findOne().lean();
    if (!policy) {
      policy = await Policy.create({ borrowDays: 14, maxBooks: 5, finePerDay: 5 });
    }
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// อัปเดตนโยบายห้องสมุดใน MongoDB
async function updatePolicy(req, res) {
  try {
    const { borrowDays, maxBooks, finePerDay } = req.body;
    let policy = await Policy.findOne();
    if (!policy) {
      policy = new Policy();
    }

    policy.borrowDays = Number(borrowDays) || policy.borrowDays;
    policy.maxBooks = Number(maxBooks) || policy.maxBooks;
    policy.finePerDay = Number(finePerDay) || policy.finePerDay;

    await policy.save();
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPolicy,
  updatePolicy
};
