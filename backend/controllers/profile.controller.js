const db = require("../db/knex");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// CONFIG MULTER FOR AVATAR UPLOAD
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/avatars";
    // ถ้ายังไม่มีโฟลเดอร์นี้ ให้สร้างขึ้นมาอัตโนมัติ
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่เป็น user_id + timestamp ป้องกันชื่อซ้ำ (เช่น avatar-1-1718956200.jpg)
    const userId = req.user ? req.user.id : "unknown";
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `avatar-${userId}-${uniqueSuffix}`);
  },
});

// ตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("รองรับเฉพาะไฟล์รูปภาพประเภท JPG, JPEG และ PNG เท่านั้น!"));
  }
};

// จำกัดขนาดไฟล์ไม่เกิน 2MB
exports.uploadAvatarMiddleware = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
}).single("avatar"); // ใช้ชื่อฟิลด์ "avatar" ส่งมาจาก FormData หน้าบ้าน


// ==========================================
// PROFILE CONTROLLERS
// ==========================================

// @route   GET /api/profile/options
// @desc    ดึงข้อมูลแผนกและกลุ่มงานสำหรับใช้ใน Dropdown
// @access  Private
exports.getOptions = async (req, res) => {
  try {
    const departments = await db("departments").select("id", "name_th").orderBy("id", "asc");
    const orgGroups = await db("org_groups").select("id", "name_th").orderBy("id", "asc");

    return res.json({
      success: true,
      departments,
      orgGroups
    });
  } catch (error) {
    console.error("Get Options API Error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลตัวเลือก",
    });
  }
};

// @route   GET /api/profile/getprofile
// @desc    ดึงข้อมูลโปรไฟล์ส่วนตัวของผู้ใช้ปัจจุบัน
// @access  Private
exports.Profile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "ไม่มีสิทธิ์เข้าถึงข้อมูล หรือ Token ไม่ถูกต้อง",
      });
    }

    const userId = req.user.id;

    const rows = await db("users as u")
      .leftJoin("departments as d", "u.department_id", "d.id")
      .select(
        "u.id",
        "u.name_th",
        "u.email",
        "u.role",
        "u.status",
        "u.department_id",
        "u.position",
        "u.avatar", // <-- เพิ่มให้ดึงรูปโปรไฟล์ออกไปด้วย
        "d.name_th as department_name",
        "u.created_at",
        "u.updated_at"
      )
      .where("u.id", userId);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้งาน",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์",
    });
  }
};

// @route   PUT /api/profile/updateprofile
// @desc    แก้ไขข้อมูลส่วนตัว (รวมถึงรูปโปรไฟล์)
// @access  Private
exports.updateProfile = async (req, res) => {
  // เรียกใช้ Middleware ของ multer ก่อนเพื่อแกะข้อมูลไฟล์และ body
  exports.uploadAvatarMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "ขนาดไฟล์ใหญ่เกินไป ห้ามเกิน 2MB" });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "ไม่มีสิทธิ์เข้าถึงข้อมูล หรือ Token ไม่ถูกต้อง",
        });
      }

      const userId = req.user.id;
      const {
        name_th,
        email,
        department_id = null,
        position = null,
      } = req.body;

      if (!name_th || !email) {
        return res.status(400).json({
          success: false,
          message: "กรุณากรอกชื่อและอีเมลให้ครบถ้วน",
        });
      }

      // เช็กอีเมลซ้ำ
      const duplicateEmail = await db("users")
        .select("id")
        .where("email", email)
        .andWhereNot("id", userId)
        .first();

      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว",
        });
      }

      const updatedDepartmentId = department_id === "" || department_id === "null" ? null : department_id;
      const updatedPosition = position === "" || position === "null" ? null : position;

      // เตรียม Object สำหรับอัปเดตฐานข้อมูล
      const updateData = {
        name_th,
        email,
        department_id: updatedDepartmentId,
        position: updatedPosition,
      };

      // ถ้ามีการอัปโหลดไฟล์เข้ามาใหม่ ให้ใส่ชื่อไฟล์ลงไปในอัปเดตด้วย
      if (req.file) {
        updateData.avatar = req.file.filename;

        // [Optional] ลบรูปเก่าทิ้งจากเซิร์ฟเวอร์เพื่อไม่ให้รกดิสก์
        const oldUserObj = await db("users").select("avatar").where("id", userId).first();
        if (oldUserObj && oldUserObj.avatar) {
          const oldPath = path.join(__dirname, "../uploads/avatars", oldUserObj.avatar);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }

      // ทำการบันทึกลง Database
      await db("users").where("id", userId).update(updateData);

      // ดึงข้อมูลโปรไฟล์ล่าสุดกลับไปแสดงที่หน้าบ้าน
      const rows = await db("users as u")
        .leftJoin("departments as d", "u.department_id", "d.id")
        .select(
          "u.id",
          "u.name_th",
          "u.email",
          "u.role",
          "u.status",
          "u.department_id",
          "u.position",
          "u.avatar",
          "d.name_th as department_name",
          "u.created_at",
          "u.updated_at"
        )
        .where("u.id", userId)
        .first();

      return res.json({
        success: true,
        message: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว",
        data: rows,
      });

    } catch (error) {
      console.error("Update Profile Error:", error);
      return res.status(500).json({
        success: false,
        message: "เซิร์ฟเวอร์เกิดความผิดพลาดในการบันทึกข้อมูล",
      });
    }
  });
};

// @route   PUT /api/profile/changepassword
// @desc    เปลี่ยนรหัสผ่านของผู้ใช้
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ให้ครบถ้วน",
      });
    }

    const user = await db("users")
      .select("password_hash")
      .where("id", userId)
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้งานระบบ",
      });
    }

    const isMatch = await bcrypt.compare(old_password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านปัจจุบันไม่ถูกต้อง!",
      });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(new_password, saltRounds);

    await db("users")
      .where("id", userId)
      .update({
        password_hash: newHashedPassword,
      });

    return res.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "เซิร์ฟเวอร์เกิดความผิดพลาดในการเปลี่ยนรหัสผ่าน",
    });
  }
};