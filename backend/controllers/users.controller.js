// controllers/users.controller.js
// ---------------------------------------------
// "ฉบับนักเรียน" : Controller คุย DB โดยตรงผ่าน Knex (ไม่มี repository)
// จุดประสงค์เพื่อให้เห็นเส้นทางข้อมูลแบบตรงไปตรงมา: HTTP -> Controller -> DB
// ---------------------------------------------

const db = require("../db/knex");   // ตัวเชื่อม MySQL ผ่าน Knex (ตั้งค่าใน db/knex.js)
const bcrypt = require("bcrypt");   // สำหรับแฮช (เข้ารหัสทางเดียว) รหัสผ่าน

// ฟังก์ชันเล็กๆ ช่วย "เลือกเฉพาะฟิลด์ที่ปลอดภัย" ไม่ส่ง password_hash ออกไป
// เหตุผล: ห้ามเปิดเผย password_hash ต่อ client เพื่อความปลอดภัย
const pickPublic = (row) =>
  row && {
    id: row.id,
    name_th: row.name_th,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
  };

/**
 * GET /api/users
 * ---------------------------
 * - แสดงรายการผู้ใช้
 * - ถ้าเป็น admin => เห็นทั้งหมด
 * - ถ้าเป็นบทบาทอื่น => เห็นเฉพาะ "ข้อมูลตัวเอง"
 * - ใช้สำหรับอธิบาย RBAC และการดึงข้อมูลแบบปลอดภัย (ไม่ส่ง password_hash)
 */




exports.list = async (req, res, next) => {
  try {
    // กรณี admin เห็นทั้งหมด
    if (req.user?.role === "admin") {
      const items = await db("users")
        .select("id", "name_th", "email", "role", "created_at")
        .orderBy("id", "desc");
      return res.json({ success: true, items, total: items.length });
    }

    // ไม่ใช่ admin -> ต้องล็อกอิน และเห็นเฉพาะตัวเอง
    if (!req.user?.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const me = await db("users")
      .select("id", "name_th", "email", "role", "created_at")
      .where({ id: req.user.id })
      .first();

    return res.json({
      success: true,
      items: me ? [me] : [],
      total: me ? 1 : 0,
    });
  } catch (e) {
    next(e); // ส่งต่อให้ error middleware รวมศูนย์การจัดการ error
  }
};


exports.list_all = async (req, res, next) => {
  try {
    const rows = await db("users as u")
      .leftJoin("departments as d", "u.department_id", "d.id")
      .select(
        "u.id",
        "u.email",
        "u.name_th",
        "u.avatar",
        "u.role",
        "u.status",
        "u.created_at",
        "u.position",

        "d.name_th as department_name"
      )
      .orderBy("u.id", "desc");

    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
};





/**
 * GET /api/users/:id
 * ---------------------------
 * - ดึงรายละเอียดผู้ใช้จาก id
 * - ใช้ .first() เพื่อได้เพียงแถวเดียว
 */
exports.get = async (req, res, next) => {
  try {
    const row = await db("users")
      .select("id", "name_th", "email", "role", "created_at")
      .where({ id: req.params.id })
      .first();

    if (!row) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/users
 * ---------------------------
 * - สร้างผู้ใช้ใหม่
 * - ตรวจค่าบังคับ (name_th, email, password)
 * - ตรวจอีเมลซ้ำ (unique)
 * - แฮชรหัสผ่านเก็บที่คอลัมน์ password_hash (ตามสคีมา)
 * - คืนข้อมูลผู้ใช้ (แบบไม่รวม password_hash)
 */
exports.create = async (req, res, next) => {
  try {
    const { name_th, email, password,department_id,position, role = "evaluatee" } = req.body || {};

    // 1) ตรวจว่ามีฟิลด์จำเป็นไหม
    if (!name_th || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "name_th, email, password required" });
    }

    // 2) ตรวจอีเมลซ้ำ (ต้อง unique)
    const exists = await db("users").where({ email }).first();
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    // 3) แฮชรหัสผ่าน แล้วบันทึกลงคอลัมน์ password_hash (ห้ามเก็บ plaintext)
    const password_hash = await bcrypt.hash(password, 10);

    // 4) insert และอ่านกลับมาเพื่อส่งให้ client
    const [insertId] = await db("users").insert({
      name_th,
      email,
      password_hash,
      role,
      department_id,
      position
    });
    const created = await db("users")
      .select("id", "name_th", "email", "role", "created_at","department_id","position")
      .where({ id: insertId })
      .first();

    res.status(201).json({ success: true, data: created });
  } catch (e) {
    next(e);
  }
};



exports.list_org_groups = async (req, res) => {
  try {
    // สมมติว่าใช้ Knex หรือ Prisma ในการดึงข้อมูล
    const orgGroups = await db('org_groups')
      .select(
        "org_groups.id",
        "org_groups.code",
        "org_groups.name_th as org_groups_name"
      )     
    res.json({
      status: 'success',
      data: orgGroups
    });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลฝ่ายได้" });
  }
};


exports.list_departments = async (req, res) => {
  try {
    const data = await db("departments as d")
      .leftJoin("vocational_categories as c", "c.id", "d.category_id")
      .leftJoin("org_groups as og", "og.id", "d.org_group_id")
      .select(
        "d.id",
        "d.code",
        "d.name_th as department_name",
        "c.id as category_id",
        "c.name_th as category_name",
        "og.id as org_group_id",
        "og.name_th as org_group_name"
      )
      .orderBy("d.name_th", "asc")

    res.json({ data })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}


/**
 * PUT /api/users/:id
 * ---------------------------
 * - อัปเดตข้อมูลผู้ใช้ตาม id
 * - อนุญาตแก้เฉพาะฟิลด์ที่ส่งมา (partial update)
 * - ถ้าเปลี่ยนอีเมล ต้องตรวจซ้ำ (unique)
 * - ถ้าส่ง password มาใหม่ -> แฮชใหม่และอัปเดต password_hash
 */





/**
 * DELETE /api/users/:id
 * ---------------------------
 * - ลบผู้ใช้ตาม id
 * - ตัวอย่างนี้จำกัดสิทธิ์เฉพาะ admin (แสดงการใช้ RBAC ชัดเจน)
 */
exports.remove = async (req, res, next) => {
  try {
    // RBAC: admin เท่านั้น
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden (admin only)" });
    }

    const affected = await db("users").where({ id: req.params.id }).del();
    if (!affected) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // convention: ลบสำเร็จตอบ success: true พอ ไม่ต้องคืนข้อมูล
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/users/server
 * ---------------------------
 * - ตัวอย่าง Server-side Pagination + Search + Sort
 * - page, itemsPerPage, sortBy, sortDesc, search
 * - สอนเรื่อง "การนับ total" และ "LIMIT/OFFSET" บน DB
 */
exports.listServer = async (req, res, next) => {
  try {
    // 1) รับค่า query string พร้อม default
    const page = Number(req.query.page || 1);
    const itemsPerPage = Number(req.query.itemsPerPage || 10);
    const sortBy = String(req.query.sortBy || "id");
    const sortDesc = req.query.sortDesc === "false" ? false : true;
    const search = String((req.query.search || "").trim());

    // 2) whitelist ชื่อคอลัมน์ที่อนุญาตให้ sort (ป้องกัน SQL Injection ทาง orderBy)
    const allowed = new Set(["id", "name_th", "email", "role", "created_at"]);
    const column = allowed.has(sortBy) ? sortBy : "id";
    const dir = sortDesc ? "DESC" : "ASC";

    // 3) คำนวณ offset และ pattern ค้นหา
    const off = (page - 1) * itemsPerPage;
    const like = `%${search}%`;

    // 4) นับจำนวนแถวทั้งหมดที่ตรง search (ใช้ count แยก 1 คำสั่ง)
    const [{ cnt }] = await db("users")
      .whereRaw("CONCAT(id,' ',name_th,' ',email,' ',role) LIKE ?", [like])
      .count({ cnt: "*" });

    // 5) ดึงแถวเฉพาะหน้าที่ต้องการ (LIMIT/OFFSET + ORDER)
    const items = await db("users")
      .select("id", "name_th", "email", "role", "created_at")
      .whereRaw("CONCAT(id,' ',name_th,' ',email,' ',role) LIKE ?", [like])
      .orderBy(column, dir)
      .limit(itemsPerPage)
      .offset(off);

    // 6) ส่งกลับพร้อม total เพื่อให้หน้าเว็บคำนวณจำนวนหน้าได้
    res.json({
      success: true,
      items,
      total: Number(cnt || 0),
      page,
      itemsPerPage,
    });
  } catch (e) {
    next(e);
  }
};
