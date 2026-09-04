const defaultData = require("../data/defaultData");
const { Book, Member, Staff, Borrow, Fine, Policy, Session } = require("../models");

/**
 * Seed ข้อมูลเริ่มต้นเข้าสู่ MongoDB (library_db)
 * @param {boolean} forceReset หากเป็น true จะล้างข้อมูลเดิมแล้วลงใหม่ทั้งหมด
 */
async function seedDatabase(forceReset = false) {
  try {
    if (forceReset) {
      await Promise.all([
        Book.deleteMany({}),
        Member.deleteMany({}),
        Staff.deleteMany({}),
        Borrow.deleteMany({}),
        Fine.deleteMany({}),
        Policy.deleteMany({}),
        Session.deleteMany({})
      ]);
      console.log("🧹 Cleared all MongoDB collections in library_db");
    }

    // 1. Staff
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0 && defaultData.staff?.length) {
      await Staff.insertMany(defaultData.staff);
      console.log(`🌱 Seeded ${defaultData.staff.length} staff to MongoDB`);
    }

    // 2. Books
    const bookCount = await Book.countDocuments();
    if (bookCount === 0 && defaultData.books?.length) {
      await Book.insertMany(defaultData.books);
      console.log(`🌱 Seeded ${defaultData.books.length} books to MongoDB`);
    }

    // 3. Members
    const memberCount = await Member.countDocuments();
    if (memberCount === 0 && defaultData.members?.length) {
      await Member.insertMany(defaultData.members);
      console.log(`🌱 Seeded ${defaultData.members.length} members to MongoDB`);
    }

    // 4. Borrows
    const borrowCount = await Borrow.countDocuments();
    if (borrowCount === 0 && defaultData.borrows?.length) {
      await Borrow.insertMany(defaultData.borrows);
      console.log(`🌱 Seeded ${defaultData.borrows.length} borrows to MongoDB`);
    }

    // 5. Fines
    const fineCount = await Fine.countDocuments();
    if (fineCount === 0 && defaultData.fines?.length) {
      await Fine.insertMany(defaultData.fines);
      console.log(`🌱 Seeded ${defaultData.fines.length} fines to MongoDB`);
    }

    // 6. Policy
    const policyCount = await Policy.countDocuments();
    if (policyCount === 0 && defaultData.policy) {
      await Policy.create(defaultData.policy);
      console.log("🌱 Seeded policy to MongoDB");
    }

    // 7. Initial active session (default: first staff member or admin)
    const sessionExists = await Session.findOne({ key: "active_user" });
    if (!sessionExists) {
      const adminStaff = await Staff.findOne({ role: "ผู้ดูแลระบบ" });
      if (adminStaff) {
        await Session.create({
          key: "active_user",
          user: {
            name: adminStaff.name,
            email: adminStaff.email,
            role: adminStaff.role,
            registeredAt: adminStaff.registeredAt
          }
        });
      }
    }
  } catch (err) {
    console.error("⚠️ Error seeding database:", err.message);
  }
}

module.exports = { seedDatabase };
