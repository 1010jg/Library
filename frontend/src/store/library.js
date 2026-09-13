import { defineStore } from "pinia";
import http from "../api/http";

export const useLibraryStore = defineStore("library", {
  state: () => ({
    currentUser: null,
    authChecked: false,

    staff: [],
    books: [],
    members: [],
    borrows: [],
    fines: [],

    policy: {
      borrowDays: 14,
      maxBooks: 5,
      finePerDay: 5
    }
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,

    isAdmin: (state) =>
      state.currentUser?.role === "ผู้ดูแลระบบ",

    isLibrarian: (state) =>
      state.currentUser?.role === "บรรณารักษ์",

    totalBooksCount: (state) =>
      state.books.reduce(
        (acc, b) => acc + Number(b.total || 0),
        0
      ),

    borrowingCount: (state) =>
      state.borrows.filter(
        (b) =>
          b.status === "กำลังยืม" ||
          b.status === "เกินกำหนด"
      ).length,

    returnedCount: (state) =>
      state.borrows.filter(
        (b) => b.status === "คืนแล้ว"
      ).length,

    overdueCount: (state) =>
      state.borrows.filter(
        (b) => b.status === "เกินกำหนด"
      ).length,

    unpaidFinesTotal: (state) =>
      state.fines
        .filter((f) => f.status === "ค้างชำระ")
        .reduce(
          (sum, f) => sum + Number(f.amount || 0),
          0
        ),

    paidFinesTotal: (state) =>
      state.fines
        .filter((f) => f.status === "ชำระแล้ว")
        .reduce(
          (sum, f) => sum + Number(f.amount || 0),
          0
        )
  },

  actions: {

    /* =====================================================
       AUTH
    ===================================================== */

    // ตรวจสอบว่ามีผู้ใช้ Login อยู่หรือไม่
    async fetchCurrentUser() {
      const token = localStorage.getItem("library_token");

      // ถ้าไม่มี Token ไม่ต้องเรียก API
      if (!token) {
        this.currentUser = null;
        this.authChecked = true;
        return null;
      }

      try {
        const { data } = await http.get("/auth/me");

        this.currentUser = data.user;
        this.authChecked = true;

        // อัปเดตข้อมูล User ล่าสุด
        if (data.user) {
          localStorage.setItem(
            "library_user",
            JSON.stringify(data.user)
          );
        }

        return data.user;

      } catch (err) {

        // Token หมดอายุหรือไม่ถูกต้อง
        if (err.response?.status === 401) {
          localStorage.removeItem("library_token");
          localStorage.removeItem("library_user");

          this.currentUser = null;
        }

        this.authChecked = true;

        throw err;
      }
    },


    // ลงทะเบียนบรรณารักษ์
    async register(payload) {
      const { data } = await http.post(
        "/auth/register",
        payload
      );

      // ⭐ เก็บ Token ของผู้ใช้คนนี้
      localStorage.setItem(
        "library_token",
        data.token
      );

      // ⭐ เก็บข้อมูลผู้ใช้
      localStorage.setItem(
        "library_user",
        JSON.stringify(data.user)
      );

      this.currentUser = data.user;
      this.authChecked = true;

      await this.fetchMembers();

      return data.user;
    },


    // Login
    async login(email) {
      const { data } = await http.post(
        "/auth/login",
        {
          email
        }
      );

      // ⭐ สำคัญที่สุด
      // เก็บ Token แยกตาม Browser
      localStorage.setItem(
        "library_token",
        data.token
      );

      // เก็บข้อมูล User
      localStorage.setItem(
        "library_user",
        JSON.stringify(data.user)
      );

      this.currentUser = data.user;
      this.authChecked = true;

      return data.user;
    },


    // Logout
    async logout() {
      try {
        await http.post("/auth/logout");
      } catch (err) {
        // ถึง Backend จะตอบ Error
        // ก็ต้อง Logout ใน Browser นี้อยู่ดี
      }

      // ⭐ ลบเฉพาะ Token ของ Browser นี้
      localStorage.removeItem("library_token");

      // ลบข้อมูล User ของ Browser นี้
      localStorage.removeItem("library_user");

      this.currentUser = null;
      this.authChecked = true;
    },


    // แก้ไข Profile
    async updateProfile(payload) {
      const { data } = await http.put(
        "/auth/profile",
        payload
      );

      this.currentUser = data.user;

      localStorage.setItem(
        "library_user",
        JSON.stringify(data.user)
      );

      await this.fetchStaff();

      return data.user;
    },


    /* =====================================================
       STAFF
    ===================================================== */

    async fetchStaff() {
      try {
        const { data } = await http.get("/staff");

        if (Array.isArray(data) && data.length > 0) {
          this.staff = data;

        } else if (
          !this.staff ||
          this.staff.length === 0
        ) {
          this.staff = [
            {
              id: "ST-001",
              name: "ผู้ดูแลระบบห้องสมุด",
              email: "admin@library.com",
              role: "ผู้ดูแลระบบ",
              phone: "081-999-8888",
              registeredAt: "01/09/2569"
            },
            {
              id: "ST-002",
              name: "น.ส. บุษบา มาดี",
              email: "librarian1@library.com",
              role: "บรรณารักษ์",
              phone: "082-111-2222",
              registeredAt: "15/01/2569"
            },
            {
              id: "ST-003",
              name: "นายเกียรติศักดิ์ พิทักษ์",
              email: "librarian2@library.com",
              role: "บรรณารักษ์",
              phone: "083-222-3333",
              registeredAt: "01/02/2569"
            }
          ];
        }

      } catch (err) {

        if (
          !this.staff ||
          this.staff.length === 0
        ) {
          this.staff = [
            {
              id: "ST-001",
              name: "ผู้ดูแลระบบห้องสมุด",
              email: "admin@library.com",
              role: "ผู้ดูแลระบบ",
              phone: "081-999-8888",
              registeredAt: "01/09/2569"
            },
            {
              id: "ST-002",
              name: "น.ส. บุษบา มาดี",
              email: "librarian1@library.com",
              role: "บรรณารักษ์",
              phone: "082-111-2222",
              registeredAt: "15/01/2569"
            },
            {
              id: "ST-003",
              name: "นายเกียรติศักดิ์ พิทักษ์",
              email: "librarian2@library.com",
              role: "บรรณารักษ์",
              phone: "083-222-3333",
              registeredAt: "01/02/2569"
            }
          ];
        }
      }
    },


    async addStaff(payload) {
      const cleanEmail = (
        payload.email || ""
      )
        .trim()
        .toLowerCase();

      // ตรวจอีเมลซ้ำ
      if (
        this.staff.some(
          (s) =>
            (s.email || "").toLowerCase() ===
            cleanEmail
        )
      ) {
        throw new Error(
          "อีเมลนี้มีอยู่ในระบบบุคลากรแล้ว กรุณาใช้อีเมลอื่น"
        );
      }

      try {
        const { data } = await http.post(
          "/staff",
          payload
        );

        this.staff.push(data);

        return data;

      } catch (err) {

        if (
          err.response?.status === 400 &&
          err.response?.data?.error
        ) {
          throw new Error(
            err.response.data.error
          );
        }

        const nextNum =
          this.staff.length + 1;

        const fallbackStaff = {
          id: `ST-${String(nextNum).padStart(3, "0")}`,
          name: payload.name.trim(),
          email: cleanEmail,
          role:
            payload.role || "บรรณารักษ์",
          phone:
            payload.phone
              ? payload.phone.trim()
              : "-",
          registeredAt:
            new Date().toLocaleDateString(
              "th-TH"
            )
        };

        this.staff.push(
          fallbackStaff
        );

        return fallbackStaff;
      }
    },


    async updateStaff(id, payload) {
      const cleanEmail = (
        payload.email || ""
      )
        .trim()
        .toLowerCase();

      if (
        this.staff.some(
          (s) =>
            s.id !== id &&
            (s.email || "").toLowerCase() ===
            cleanEmail
        )
      ) {
        throw new Error(
          "อีเมลนี้มีบุคลากรท่านอื่นใช้งานอยู่แล้ว"
        );
      }

      try {
        const { data } = await http.put(
          `/staff/${id}`,
          payload
        );

        const idx =
          this.staff.findIndex(
            (s) => s.id === id
          );

        if (idx !== -1) {
          this.staff[idx] = data;
        }

        if (
          this.currentUser &&
          this.currentUser.email.toLowerCase() ===
          cleanEmail
        ) {
          this.currentUser = {
            ...this.currentUser,
            name: data.name,
            role: data.role
          };

          localStorage.setItem(
            "library_user",
            JSON.stringify(
              this.currentUser
            )
          );
        }

        return data;

      } catch (err) {

        if (
          err.response?.status === 400 &&
          err.response?.data?.error
        ) {
          throw new Error(
            err.response.data.error
          );
        }

        const idx =
          this.staff.findIndex(
            (s) => s.id === id
          );

        if (idx !== -1) {

          this.staff[idx] = {
            ...this.staff[idx],
            name:
              payload.name.trim(),
            email: cleanEmail,
            role:
              payload.role ||
              this.staff[idx].role,
            phone:
              payload.phone
                ? payload.phone.trim()
                : this.staff[idx].phone
          };

          if (
            this.currentUser &&
            this.currentUser.email.toLowerCase() ===
            cleanEmail
          ) {
            this.currentUser = {
              ...this.currentUser,
              name:
                this.staff[idx].name,
              role:
                this.staff[idx].role
            };

            localStorage.setItem(
              "library_user",
              JSON.stringify(
                this.currentUser
              )
            );
          }
        }

        return this.staff[idx];
      }
    },


    async deleteStaff(id) {
      try {
        await http.delete(
          `/staff/${id}`
        );

        this.staff =
          this.staff.filter(
            (s) => s.id !== id
          );

      } catch (err) {

        if (
          err.response?.status === 400 &&
          err.response?.data?.error
        ) {
          throw new Error(
            err.response.data.error
          );
        }

        this.staff =
          this.staff.filter(
            (s) => s.id !== id
          );
      }
    },


    /* =====================================================
       BOOKS
    ===================================================== */

    async fetchBooks() {
      const { data } =
        await http.get("/books");

      this.books = data;
    },


    async addBook(payload) {
      const { data } =
        await http.post(
          "/books",
          payload
        );

      this.books.push(data);

      return data;
    },


    async updateBook(id, payload) {
      const { data } =
        await http.put(
          `/books/${id}`,
          payload
        );

      const idx =
        this.books.findIndex(
          (b) => b.id === id
        );

      if (idx !== -1) {
        this.books[idx] = data;
      }

      return data;
    },


    async deleteBook(id) {
      await http.delete(
        `/books/${id}`
      );

      this.books =
        this.books.filter(
          (b) => b.id !== id
        );
    },


    /* =====================================================
       MEMBERS
    ===================================================== */

    async fetchMembers() {
      const { data } =
        await http.get("/members");

      this.members = data;
    },


    async addMember(payload) {
      const { data } =
        await http.post(
          "/members",
          payload
        );

      this.members.push(data);

      return data;
    },


    async updateMember(id, payload) {
      const { data } =
        await http.put(
          `/members/${id}`,
          payload
        );

      const idx =
        this.members.findIndex(
          (m) => m.id === id
        );

      if (idx !== -1) {
        this.members[idx] = data;
      }

      return data;
    },


    async deleteMember(id) {
      await http.delete(
        `/members/${id}`
      );

      this.members =
        this.members.filter(
          (m) => m.id !== id
        );
    },


    /* =====================================================
       BORROWS
    ===================================================== */

    async fetchBorrows() {
      const { data } =
        await http.get("/borrows");

      this.borrows = data;
    },


    async createBorrow(payload) {
      const { data } =
        await http.post(
          "/borrows",
          payload
        );

      this.borrows.push(data);

      await this.fetchBooks();

      return data;
    },


    async returnBorrow(id) {
      const { data } =
        await http.post(
          `/borrows/${id}/return`
        );

      const idx =
        this.borrows.findIndex(
          (b) => b.id === id
        );

      if (idx !== -1) {
        this.borrows[idx] = data;
      }

      await this.fetchBooks();

      return data;
    },


    /* =====================================================
       FINES
    ===================================================== */

    async fetchFines() {
      const { data } =
        await http.get("/fines");

      this.fines = data;
    },


    async createFine(payload) {
      const { data } =
        await http.post(
          "/fines",
          payload
        );

      this.fines.push(data);

      return data;
    },


    async payFine(id) {
      const { data } =
        await http.post(
          `/fines/${id}/pay`
        );

      const idx =
        this.fines.findIndex(
          (f) => f.id === id
        );

      if (idx !== -1) {
        this.fines[idx] = data;
      }

      return data;
    },


    /* =====================================================
       POLICY
    ===================================================== */

    async fetchPolicy() {
      const { data } =
        await http.get("/policy");

      this.policy = data;
    },


    async updatePolicy(payload) {
      const { data } =
        await http.put(
          "/policy",
          payload
        );

      this.policy = data;

      return data;
    },


    /* =====================================================
       SYSTEM
    ===================================================== */

    async resetSystem() {
      const { data } =
        await http.post(
          "/system/reset"
        );

      // ล้าง Login ของ Browser นี้
      localStorage.removeItem(
        "library_token"
      );

      localStorage.removeItem(
        "library_user"
      );

      this.currentUser = null;
      this.authChecked = true;

      this.staff =
        data.data.staff || [];

      this.books =
        data.data.books || [];

      this.members =
        data.data.members || [];

      this.borrows =
        data.data.borrows || [];

      this.fines =
        data.data.fines || [];

      this.policy =
        data.data.policy || {
          borrowDays: 14,
          maxBooks: 5,
          finePerDay: 5
        };
    },


    /* =====================================================
       BOOTSTRAP
    ===================================================== */

    async loadAll() {
      await Promise.all([
        this.fetchStaff(),
        this.fetchBooks(),
        this.fetchMembers(),
        this.fetchBorrows(),
        this.fetchFines(),
        this.fetchPolicy()
      ]);
    }
  }
});