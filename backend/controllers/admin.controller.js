const db = require("../db/knex");
const PDFDocument = require("pdfkit");
const path = require("path");

// ดึงรอบการประเมินทั้งหมด
exports.list = async (req, res) => {
  try {
    const now = new Date();
    await db("evaluation_periods")
      .where("is_active", 1)
      .andWhere("end_date", "<", now)
      .update({ is_active: 0 });

    const data = await db("evaluation_periods")
      .select("*")
      .orderBy("id", "desc");

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// แสดงผู้ใช้ที่เป็น evaluatee
exports.list_evaluatee = async (req, res) => {
  try {
    const role = req.query.role || "evaluatee";

    // 1. ดึงข้อมูล User ปกติ
    let data = await db("users as u")
      .leftJoin("departments as d", "d.id", "u.department_id")
      .select(
        "u.id",
        "u.name_th",
        "u.email",
        "u.avatar",
        "u.role",
        "u.position",
        "d.id as department_id",
        "d.name_th as department_name",
      )
      .where("u.role", role)
      .orderBy("u.name_th", "asc");

    // 2. ดึงข้อมูลผลการประเมินของทุกคนที่อยู่ในรายการนี้
    const userIds = data.map((u) => u.id);
    const evaluationResults = await db("evaluation_results")
      .whereIn("evaluatee_id", userIds)
      .select("evaluatee_id", "status");

    // ดึงข้อมูล assignments เพื่อมาเช็คสถานะการประเมิน
    const assignments = await db("assignments")
      .whereIn("evaluatee_id", userIds)
      .select("evaluatee_id", "evaluator_status");

    // 3. รวมข้อมูลผลประเมินและ assignments เข้าไปใน data ของแต่ละ user
    data = data.map((user) => {
      return {
        ...user,
        evaluation_result: evaluationResults.filter(
          (r) => r.evaluatee_id === user.id,
        ),
        assignments: assignments.filter(
          (a) => a.evaluatee_id === user.id,
        ),
      };
    });

    const total = data.length;
    res.json({ total, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// แสดงผู้ใช้ที่เป็น evaluator
exports.list_evaluator = async (req, res) => {
  try {
    const data = await db("users as u")
      .leftJoin("departments as d", "d.id", "u.department_id")
      .select(
        "u.id",
        "u.name_th",
        "u.email",
        "u.avatar",
        "u.role",
        "u.position",
        "d.id as department_id",
        "d.name_th as department_name",
      )
      .where("u.role", "evaluator")
      .orderBy("u.name_th", "asc");

    res.json({ data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// แสดงรายชื่อแผนก
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
        "og.name_th as org_group_name",
      )
      .orderBy("d.name_th", "asc");

    res.json({ data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// get org group
exports.list_org_groups = async (req, res) => {
  try {
    const data = await db("org_groups as og")
      .select("og.id as org_group_id", "og.code", "og.name_th as org_group_name")
      .orderBy("id", "desc");

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ดึงการจับคู่ผู้ประเมินกับคุณครู
exports.list_assignments = async (req, res) => {
  try {
    const data = await db("assignments as a")
      .join("evaluation_periods as p", "p.id", "a.period_id")
      .join("users as evalr", "evalr.id", "a.evaluator_id")
      .join("users as evale", "evale.id", "a.evaluatee_id")
      .leftJoin("departments as d", "d.id", "a.dept_id")
      .leftJoin("self_eval_submissions as ses", function () {
        this.on("ses.period_id", "=", "a.period_id")
          .andOn("ses.evaluatee_id", "=", "a.evaluatee_id");
      })
      .select(
        "a.id",
        "a.period_id",
        "a.evaluator_id",
        "a.evaluatee_id",
        "a.dept_id",
        "a.evaluator_role",
        "a.evaluator_signature",
        "a.evaluator_status",

        // Status fields
        db.raw("COALESCE(ses.status, 'pending') as self_eval_status"),
        "a.evaluator_status",
        "ses.signed_at as self_eval_signed_at",
        "a.evaluator_signed_at",
        "a.acknowledge_signed_at",

        // ชื่อไว้แสดง
        "p.name_th as period_name",
        "p.buddhist_year",
        "evalr.name_th as evaluator_name",
        "evalr.avatar as evaluator_avatar",
        "evalr.position as evaluator_position",
        "evale.name_th as evaluatee_name",
        "evale.avatar as evaluatee_avatar",
        "evale.position as evaluatee_position",
        "d.name_th as department_name",

        "a.created_at",
      )
      .orderBy("a.id", "desc");

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// สร้างการจับคู่
exports.create_assignments = async (req, res) => {
  try {
    // 🟢 1. รับค่า evaluator_role เพิ่มเข้ามา
    const { period_id, evaluator_id, evaluatee_id, dept_id, evaluator_role } = req.body; 

    await db("assignments").insert({
      period_id,
      evaluator_id,
      evaluatee_id,
      dept_id,
      evaluator_role, // 🟢 2. เพิ่มคอลัมน์นี้เข้าไปตอน insert
    });

    res.json({ success: true });
  } catch (err) {
    // uniq_asg จะกันไม่ให้จับคู่ซ้ำ
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


exports.update_assignments = async (req, res) => {
  try {
    const { id } = req.params;
    // 🟢 1. รับค่า evaluator_role และ evaluator_status เพิ่มเข้ามา
    const { period_id, evaluator_id, evaluatee_id, dept_id, evaluator_role, evaluator_status } = req.body; 
    
    await db("assignments").where({ id }).update({
      period_id,
      evaluator_id,
      evaluatee_id,
      dept_id,
      evaluator_role, // 🟢 2. สั่ง update ลงตาราง
      evaluator_status,
    });

    res.json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// เพิ่มรอบประเมิน
exports.create = async (req, res) => {
  try {
    const { code, name_th, buddhist_year, start_date, end_date, is_active } =
      req.body;
    if (is_active == 1) {
      await db("evaluation_periods").update({ is_active: 0 });
    }
    // สร้างปีใหม่ (Default active = 0 ไปก่อน เดี๋ยวค่อยสั่งเปิด)
    await db("evaluation_periods").insert({
      code,
      name_th,
      buddhist_year,
      start_date,
      end_date,
      is_active: is_active ? 1 : 0,
    });
    res.json({ message: "สร้างปีการประเมินเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไขรอบประเมิน
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_th, buddhist_year, start_date, end_date, is_active } =
      req.body;

    // ถ้าเปิดใช้งานตัวนี้ ให้ปิดตัวอื่นทั้งหมดก่อน
    if (is_active == 1) {
      await db("evaluation_periods").update({ is_active: 0 });
    }

    await db("evaluation_periods")
      .where({ id })
      .update({
        code,
        name_th,
        buddhist_year,
        start_date,
        end_date,
        is_active: is_active ? 1 : 0,
      });

    res.json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ลบรอบการประเมิน
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    await db("evaluation_periods").where({ id }).del();

    res.json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove_assignments = async (req, res) => {
  try {
    const { id } = req.params;

    await db("assignments").where({ id }).del();

    res.json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ดึง cat
exports.list_categories = async (req, res) => {
  try {
    const data = await db("vocational_categories")
      .select("*")
      .orderBy("id", "desc");

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//เพิ่ม cat
exports.create_cat = async (req, res) => {
  try {
    const { code, name_th, created_at } = req.body;
    await db("vocational_categories").insert({
      code,
      name_th,
      created_at,
    });
    res.json({ message: "สร้างหมวดหมู่เรียบร้อย" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไข cat
exports.update_cat = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_th } = req.body;

    await db("vocational_categories").where({ id }).update({
      code,
      name_th,
    });

    res.json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ลบ cat
exports.remove_cat = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteData = await db("vocational_categories")
      .where({ id: id })
      .del();
    res.json({ message: deleteData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//หน้าส่องการประเมินจาก evaluator
exports.myassignments = async (req, res) => {
  try {
    const { id, role } = req.user;

    const q = db("assignments as a")
      .join("users as u", "u.id", "a.evaluatee_id")
      .leftJoin("departments as d", "d.id", "a.dept_id")
      .join("evaluation_periods as p", "p.id", "a.period_id")
      .select(
        "a.id",
        "a.period_id",
        "a.evaluatee_id",
        "a.evaluator_id",
        "a.evaluator_role",
        "u.name_th as evaluatee_name",
        "d.name_th as dept_name",
        "p.name_th as period_name",
      );

    // ✅ evaluator → เห็นเฉพาะของตัวเอง
    if (role === "evaluator") {
      q.where("a.evaluator_id", id);
    }

    // ✅ admin → ไม่ต้อง where อะไร เห็นทั้งหมด

    const data = await q.orderBy("a.id", "desc");

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// ลบผู้ใช้งาน (ทั้ง evaluatee และ evaluator) โดย admin
exports.remove_user = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteUser = await db("users").where({ id: id }).del();
    res.json({ message: deleteUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------
// 2. ดึง attachments ของครูที่ถูกประเมิน
// --------------------------------------------------
exports.attachments = async (req, res) => {
  try {
    const { evaluatee_id, period_id } = req.query;

    // ---- เพิ่ม validation ก่อน ----
    if (!evaluatee_id || !period_id) {
      return res.status(400).json({
        status: "Error",
        message: "evaluatee_id and period_id are required",
      });
    }

    const data = await db("attachments as a")
      .join("indicators as i", "i.id", "a.indicator_id")
      .join("evidence_types as e", "e.id", "a.evidence_type_id")
      .where({
        "a.evaluatee_id": evaluatee_id,
        "a.period_id": period_id,
      })
      .select(
        "a.id",
        "a.indicator_id",
        "a.file_name",
        "a.storage_path",
        "i.name_th as indicator_name",
        "e.name_th as evidence_name",
      );

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};


exports.update_user = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing user ID" });

    const { name_th, email, role, password ,status,department_id,position} = req.body || {};
    const payload = {};

    // 1) เก็บเฉพาะฟิลด์ที่ส่งเข้ามา (ไม่บังคับต้องส่งครบ)
    if (name_th != null) payload.name_th = name_th;
    if (email != null) payload.email = email;
    if (role != null) payload.role = role;
    if (status != null) payload.status = status;
    if (department_id != null) payload.department_id = department_id;
    if (position != null) payload.position = position;
    

    // 2) ถ้าเปลี่ยนรหัสผ่าน -> แฮชใหม่
    if (password && password.trim() !== "") {
      payload.password_hash = await bcrypt.hash(password, 10);
    }

    // 3) ถ้าจะเปลี่ยนอีเมล -> ตรวจซ้ำกับคนอื่น (ห้ามชนกับผู้ใช้รายอื่น)
    if (payload.email) {
      const dup = await db("users")
        .where({ email: payload.email })
        .andWhereNot({ id })
        .first();

      if (dup) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }
    }

    // 4) update และตรวจว่ามีแถวที่ถูกอัปเดตไหม
    const affected = await db("users").where({ id }).update(payload);
    if (!affected) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 5) อ่านข้อมูลล่าสุดกลับเพื่อส่งให้ client (ไม่รวม password_hash)
    const updated = await db("users")
      .select("id", "name_th", "email", "role", "created_at","department_id","position")
      .where({ id })
      .first();

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

// --------------------------------------------------
// 3. ดึง indicators ทั้งหมดเพื่อใช้สร้างฟอร์มให้คะแนน
// --------------------------------------------------
exports.indicators = async (req, res) => {
  try {
    const data = await db("indicators").select("*");

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 4. ดึงผลคะแนนเดิม (ถ้ามี)
// --------------------------------------------------
exports.results = async (req, res) => {
  try {
    const { evaluatee_id, period_id } = req.query;
    const evaluator_id = req.user.id;

    const data = await db("evaluation_results")
      .where({
        evaluatee_id,
        period_id,
        evaluator_id,
      })
      .select("indicator_id", "score", "value_yes_no", "notes", "status");

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 5. บันทึกคะแนน (insert/update)
// --------------------------------------------------
exports.save = async (req, res) => {
  try {
    const evaluator_id = req.user.id;
    const rows = req.body;

    for (const r of rows) {
      const exists = await db("evaluation_results")
        .where({
          period_id: r.period_id,
          evaluatee_id: r.evaluatee_id,
          evaluator_id: evaluator_id,
          indicator_id: r.indicator_id,
        })
        .first();

      if (exists) {
        await db("evaluation_results").where({ id: exists.id }).update({
          score: r.score,
          value_yes_no: r.value_yes_no,
          notes: r.notes,
        });
      } else {
        await db("evaluation_results").insert({
          period_id: r.period_id,
          evaluatee_id: r.evaluatee_id,
          evaluator_id: evaluator_id,
          topic_id: r.topic_id,
          indicator_id: r.indicator_id,
          score: r.score,
          value_yes_no: r.value_yes_no,
          notes: r.notes,
          status: "draft",
        });
      }
    }

    res.json({ message: "saved" });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};
//หน้าส่องการประเมินจาก evaluator -----------------------------

// ดึง topics
exports.list_topics = async (req, res) => {
  try {
    const rows = await db("evaluation_topics")
      .select(
        "id",
        "code",
        "title_th",
        "description",
        "weight",
        "active",
        "created_at",
      )
      .orderBy("id", "asc");

    // แปลงค่า active จาก 1/0 เป็น active/inactive
    const data = rows.map((item) => ({
      ...item,
      active: item.active === 1 ? "active" : "inactive",
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// อัพเดท Topics
exports.update_topics = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title_th, description, weight, active } = req.body;
    await db("evaluation_topics").where({ id }).update({
      code,
      title_th,
      description,
      weight,
      active,
    });

    res.json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// เพิ่ม topics
exports.create_topics = async (req, res) => {
  try {
    // ลอง Log ดูว่า Frontend ส่งอะไรมาบ้าง
    console.log("Request Body:", req.body);

    const { code, title_th, description, weight, active } = req.body;

    // ตรวจสอบค่าว่างเบื้องต้น
    if (!code || !title_th) {
      return res.status(400).json({ message: "กรุณาระบุรหัสและชื่อหัวข้อ" });
    }

    await db("evaluation_topics").insert({
      code: code,
      title_th: title_th,
      description: description || "", // ถ้าว่างให้ใส่ String ว่าง
      weight: parseFloat(weight) || 0, // แปลงเป็นตัวเลข ถ้าไม่ใช่เลขให้เป็น 0
      active: active === "active" ? 1 : 0,
      created_at: new Date(), // ใส่เผื่อฐานข้อมูลต้องการ
    });

    res.json({ success: true, message: "สร้างสำเร็จ" });
  } catch (err) {
    // พิมพ์ Error ออกมาดูที่หน้าจอ Terminal (สำคัญมาก)
    console.error("Database Error:", err.sqlMessage || err.message);

    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดที่ระบบฐานข้อมูล",
      error: err.sqlMessage || err.message, // ส่ง error กลับไปดูที่ Browser Console ด้วย
    });
  }
};

exports.delete_topic = async (req, res) => {
  try {
    const { id } = req.params;

    await db("evaluation_topics").where({ id }).del();

    res.json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// อัพเดท indicators
exports.update_indicator = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      topic_id,
      code,
      name_th,
      description,
      type,
      weight,
      min_score,
      max_score,
      active,
    } = req.body;
    await db("indicators").where({ id }).update({
      topic_id,
      code,
      name_th,
      description,
      type,
      weight,
      min_score,
      max_score,
      active,
    });

    res.json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// เพิ่ม indicators
exports.create_indicator = async (req, res) => {
  try {
    const {
      topic_id,
      code,
      name_th,
      description,
      type,
      weight,
      min_score,
      max_score,
      active = 1,
    } = req.body;

    // สร้างปีใหม่ (Default active = 0 ไปก่อน เดี๋ยวค่อยสั่งเปิด)
    await db("indicators").insert({
      topic_id,
      code,
      name_th,
      description,
      type,
      weight,
      min_score,
      max_score,
      active,
    });
    res.json({ message: "สร้างตัวชี้วัดเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete_indicator = async (req, res) => {
  try {
    const { id } = req.params;

    await db("indicators").where({ id }).del();

    res.json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.list_attachments = async (req, res) => {
  try {
    // ดึงข้อมูลทั้งหมดโดยไม่มีการใช้ .where() เพื่อกรองข้อมูล
    const data = await db("attachments as a")
      .join("indicators as i", "i.id", "a.indicator_id")
      .join("evidence_types as e", "e.id", "a.evidence_type_id")
      .select(
        "a.id",
        "a.indicator_id",
        "a.file_name",
        "a.storage_path",
        "i.name_th as indicator_name",
        "e.name_th as evidence_name",
      );

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// GET /api/dashboard/average_score
exports.average_score = async (req, res) => {
  try {
    // สมมติว่าต้องการคะแนนเฉลี่ยของรอบการประเมินปัจจุบัน
    // เปลี่ยน period_id เป็นค่าที่ต้องการ หรือดึงจากตาราง active_period
    const currentPeriodId = 1;

    const result = await db("evaluation_results")
      .where({
        status: "submitted",
        period_id: currentPeriodId,
      })
      .select(
        db.raw(
          "AVG(CASE WHEN score IS NOT NULL THEN score WHEN value_yes_no = 1 THEN 4.00 ELSE 1.00 END) as averageScore"
        )
      )
      .first();

    // ปัดเศษให้เป็นทศนิยม 2 ตำแหน่ง
    const avg = parseFloat(result.averageScore || 0).toFixed(2);

    res.json({
      success: true,
      data: { averageScore: avg },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API สำหรับสร้าง PDF

// ในไฟล์ controller ของคุณ

exports.export_report = async (req, res) => {
  try {
    // 1. SELECT ข้อมูลจาก SQL (เหมือนเดิม)
    // แก้ไขคำสั่งดึงข้อมูลใน exports.export_report
    const personnelList = await db("users as u")
      .join("evaluation_results as er", "u.id", "er.evaluatee_id")
      .select("u.name_th as name")
      // ใช้ CASE WHEN เพื่อประมวลผลสถานะภาพรวมของคนๆ นั้น
      // ถ้าในบรรดาตัวชี้วัดทั้งหมด มีคำว่า 'draft' ปนอยู่แม้แต่ข้อเดียว ให้ภาพรวมเป็น 'draft' ทันที
      // แต่ถ้าไม่มี 'draft' เลย (มีแต่ submitted) ให้ภาพรวมเป็น 'submitted'
      .select(
        db.raw(
          "CASE WHEN SUM(CASE WHEN er.status = 'draft' THEN 1 ELSE 0 END) > 0 THEN 'draft' ELSE 'submitted' END as status",
        ),
      )
      .where("u.role", "evaluatee") // ดึงเฉพาะผู้รับการประเมิน
      .groupBy("u.id", "u.name_th");

    // 2. ตั้งค่ากระดาษ
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=summary_report.pdf",
    );
    doc.pipe(res);

    // 3. ใส่ฟอนต์ภาษาไทย
    doc.registerFont("ThaiFont", "fonts/sarabun-regular.ttf");
    doc.font("ThaiFont");

    // ==========================================
    // 4. ส่วนหัวรายงาน (Header)
    // ==========================================
    doc.fontSize(22).text("รายงานสรุปผลการประเมินภาพรวม", { align: "center" });
    doc.moveDown(1);
    doc
      .fontSize(12)
      .text(`วันที่พิมพ์รายงาน: ${new Date().toLocaleDateString("th-TH")}`, {
        align: "right",
      });
    doc.moveDown(1);

    // ==========================================
    // 5. สร้างส่วนหัวของตาราง (Table Header)
    // ==========================================
    let currentY = doc.y; // เก็บตำแหน่งแนวตั้งปัจจุบันไว้

    // วาดเส้นตารางด้านบนของ Header
    doc.moveTo(50, currentY).lineTo(545, currentY).stroke();

    // พิมพ์ชื่อคอลัมน์ (กำหนดพิกัด X ของแต่ละคอลัมน์)
    doc.fontSize(14).font("ThaiFont");
    doc.text("ลำดับ", 60, currentY + 8);
    doc.text("ชื่อ - นามสกุลบุคลากร", 130, currentY + 8);
    doc.text("สถานะการประเมิน", 420, currentY + 8);

    // วาดเส้นตารางด้านล่างของ Header
    doc
      .moveTo(50, currentY + 30)
      .lineTo(545, currentY + 30)
      .stroke();

    // ขยับ Y ลงมาใต้ Header เพื่อเตรียมพิมพ์ข้อมูล
    currentY += 30;

    // ==========================================
    // 6. Loop ข้อมูลจากฐานข้อมูลมาใส่ในแถวตาราง
    // ==========================================
    personnelList.forEach((person, index) => {
      // ตรวจสอบก่อนว่าถ้าพิมพ์แถวนี้แล้วจะตกขอบกระดาษไหม (A4 สูงประมาณ 842)
      // ถ้าใกล้เต็มหน้า ให้สั่งเพิ่มหน้าใหม่ และวาด Header ตารางใหม่
      if (currentY > 750) {
        doc.addPage();
        currentY = 50; // เริ่มต้น Y ใหม่ที่หัวกระดาษหน้าถัดไป

        // วาด Header ตารางซ้ำในหน้าใหม่
        doc.moveTo(50, currentY).lineTo(545, currentY).stroke();
        doc.text("ลำดับ", 60, currentY + 8);
        doc.text("ชื่อ - นามสกุลบุคลากร", 130, currentY + 8);
        doc.text("สถานะการประเมิน", 420, currentY + 8);
        doc
          .moveTo(50, currentY + 30)
          .lineTo(545, currentY + 30)
          .stroke();
        currentY += 30;
      }

      // พิมพ์ข้อมูลรายบุคคลลงในพิกัด X ที่ตรงกับ Header
      doc.fontSize(12);
      doc.text(index + 1, 60, currentY + 8);
      doc.text(person.name || "ไม่ระบุชื่อ", 130, currentY + 8);
      doc.text(person.status || "ไม่มีข้อมูล", 420, currentY + 8);

      // วาดเส้นปิดท้ายแถว
      doc
        .moveTo(50, currentY + 28)
        .lineTo(545, currentY + 28)
        .strokeColor("#cccccc")
        .stroke(); // ใช้สีเทาอ่อนให้ดูนวลตา

      // ขยับพิกัด Y ลงไปสำหรับแถวถัดไป
      currentY += 28;
    });

    // ==========================================
    // 7. สรุปท้ายรายงาน
    // ==========================================
    doc.moveDown(2);
    doc.strokeColor("#000000"); // คืนค่าเส้นสีดำ
    doc
      .fontSize(13)
      .text(
        `รวมจำนวนบุคลากรที่อยู่ในระบบทั้งสิ้น: ${personnelList.length} คน`,
        50,
        doc.y,
      );

    doc.end();
  } catch (error) {
    console.error("PDF Error:", error);
    if (!res.headersSent) {
      res.status(500).send("เกิดข้อผิดพลาดในการสร้างรายงาน");
    }
  }
};

exports.export_overview_report = async (req, res) => {
  try {
    const requestedPeriodId = Number(req.query.period_id || 0);
    const periodRow = requestedPeriodId
      ? await db("evaluation_periods").where({ id: requestedPeriodId }).first()
      : await db("evaluation_periods").where({ is_active: 1 }).orderBy("id", "desc").first();
    const period = periodRow || await db("evaluation_periods").orderBy("id", "desc").first();

    if (!period) {
      return res.status(404).json({ message: "ไม่พบรอบการประเมิน" });
    }

    const fontPath = path.join(__dirname, "..", "fonts", "Sarabun-Regular.ttf");
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 28,
      bufferPages: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=overview_report_${period.id}.pdf`);
    doc.pipe(res);
    doc.registerFont("ThaiFont", fontPath);
    doc.font("ThaiFont");

    const W = doc.page.width;
    const H = doc.page.height;
    const M = 28;
    const CW = W - M * 2;

    const fmtDate = (value) => {
      if (!value) return "-";
      try {
        return new Date(value).toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return String(value);
      }
    };

    const fmtDateTime = (value) => {
      if (!value) return "-";
      try {
        return new Date(value).toLocaleString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return String(value);
      }
    };

    const card = (x, y, w, h, fill, stroke) => {
      doc.save();
      doc.roundedRect(x, y, w, h, 12).fillAndStroke(fill, stroke);
      doc.restore();
    };

    const progress = (x, y, w, value, fill) => {
      const pct = Math.max(0, Math.min(100, Number(value || 0)));
      doc.save();
      doc.roundedRect(x, y, w, 8, 999).fill("#E2E8F0");
      doc.roundedRect(x, y, (w * pct) / 100, 8, 999).fill(fill);
      doc.restore();
      doc.fillColor("#64748B").fontSize(8).text(`${pct}%`, x + w + 5, y - 3, { width: 24, align: "right" });
    };

    const stageMeta = {
      not_started: { label: "ยังไม่เริ่ม", fill: "#64748B" },
      self_draft: { label: "กำลังกรอกตนเอง", fill: "#F59E0B" },
      committee_in_progress: { label: "กรรมการกำลังประเมิน", fill: "#4F46E5" },
      completed: { label: "เสร็จสมบูรณ์", fill: "#10B981" },
    };

    const pill = (x, y, label, fill) => {
      const padX = 10;
      const pillWidth = Math.max(56, Math.ceil(doc.widthOfString(label, { fontSize: 8.5 })) + padX * 2);
      card(x, y, pillWidth, 18, fill, fill);
      doc.fillColor("#FFFFFF").fontSize(8.5).text(label, x + padX, y + 4, {
        width: pillWidth - padX * 2,
        align: "center",
      });
      return pillWidth;
    };

    const totalIndicators = Number((await db("indicators").where({ active: 1 }).count({ total: "*" }).first())?.total || 0);

    const assignmentRows = await db("assignments as a")
      .join("users as evale", "evale.id", "a.evaluatee_id")
      .leftJoin("departments as d", "d.id", "evale.department_id")
      .where("a.period_id", period.id)
      .select(
        "a.evaluatee_id",
        "a.evaluator_id",
        "a.evaluator_role",
        "a.evaluator_status",
        "a.evaluator_signed_at",
        "a.acknowledge_signed_at",
        "a.created_at as assignment_created_at",
        "evale.name_th as evaluatee_name",
        "evale.email as evaluatee_email",
        "d.name_th as department_name",
        "evale.position"
      );

    const submissionRows = await db("self_eval_submissions as ses")
      .where("ses.period_id", period.id)
      .select("ses.evaluatee_id", "ses.status", "ses.signature", "ses.signed_at", "ses.updated_at");

    const selfRows = await db("self_evaluation_results as ser")
      .where("ser.period_id", period.id)
      .select("ser.evaluatee_id", "ser.indicator_id", "ser.score", "ser.value_yes_no", "ser.notes", "ser.status", "ser.updated_at");

    const committeeRows = await db("evaluation_results as er")
      .where("er.period_id", period.id)
      .select("er.evaluatee_id", "er.evaluator_id", "er.indicator_id", "er.score", "er.value_yes_no", "er.notes", "er.status", "er.updated_at");

    const participantIds = [...new Set([
      ...assignmentRows.map((r) => r.evaluatee_id),
      ...submissionRows.map((r) => r.evaluatee_id),
      ...selfRows.map((r) => r.evaluatee_id),
      ...committeeRows.map((r) => r.evaluatee_id),
    ])];

    const evaluateeRows = participantIds.length
      ? await db("users as u")
          .leftJoin("departments as d", "d.id", "u.department_id")
          .whereIn("u.id", participantIds)
          .select("u.id", "u.name_th as evaluatee_name", "u.email as evaluatee_email", "d.name_th as department_name", "u.position")
      : [];

    const submissionMap = new Map(submissionRows.map((row) => [row.evaluatee_id, row]));
    const selfMap = new Map();
    const committeeMap = new Map();
    const assignmentMap = new Map();
    for (const row of selfRows) {
      if (!selfMap.has(row.evaluatee_id)) selfMap.set(row.evaluatee_id, []);
      selfMap.get(row.evaluatee_id).push(row);
    }
    for (const row of committeeRows) {
      if (!committeeMap.has(row.evaluatee_id)) committeeMap.set(row.evaluatee_id, []);
      committeeMap.get(row.evaluatee_id).push(row);
    }
    for (const row of assignmentRows) {
      if (!assignmentMap.has(row.evaluatee_id)) assignmentMap.set(row.evaluatee_id, []);
      assignmentMap.get(row.evaluatee_id).push(row);
    }

    const records = evaluateeRows.map((user) => {
      const submission = submissionMap.get(user.id) || null;
      const selfItems = selfMap.get(user.id) || [];
      const committeeItems = committeeMap.get(user.id) || [];
      const assignments = assignmentMap.get(user.id) || [];
      const selfSubmitted = selfItems.filter((row) => row.status === "submitted").length;
      const committeeSubmitted = committeeItems.filter((row) => row.status === "submitted").length;
      const selfTotal = totalIndicators > 0 ? totalIndicators : selfItems.length;
      const committeeTotal = assignments.length * (totalIndicators || 0);
      const lastActivity = [
        submission?.updated_at || submission?.signed_at || null,
        ...selfItems.map((row) => row.updated_at).filter(Boolean),
        ...committeeItems.map((row) => row.updated_at).filter(Boolean),
        ...assignments.map((row) => row.acknowledge_signed_at || row.evaluator_signed_at || row.assignment_created_at).filter(Boolean),
      ].reduce((latest, value) => {
        if (!value) return latest;
        if (!latest) return value;
        return new Date(value) > new Date(latest) ? value : latest;
      }, null);

      const stage = !submission
        ? "not_started"
        : submission.status === "submitted" && assignments.length > 0 && assignments.every((item) => item.evaluator_status === "completed")
          ? "completed"
          : submission.status === "submitted"
            ? "committee_in_progress"
            : "self_draft";

      return {
        ...user,
        self_status: submission?.status || "pending",
        self_progress: selfTotal > 0 ? Math.round((selfSubmitted / selfTotal) * 100) : 0,
        committee_progress: committeeTotal > 0 ? Math.round((committeeSubmitted / committeeTotal) * 100) : 0,
        self_submitted: selfSubmitted,
        self_total: selfTotal,
        committee_submitted: committeeSubmitted,
        committee_total: committeeTotal,
        stage,
        last_activity_at: lastActivity,
        assignments,
      };
    }).sort((a, b) => {
      const order = { not_started: 0, self_draft: 1, committee_in_progress: 2, completed: 3 };
      return (order[a.stage] || 99) - (order[b.stage] || 99) || a.evaluatee_name.localeCompare(b.evaluatee_name, "th");
    });

    const averageScoreRows = committeeRows.filter((row) => row.status === "submitted");
    const averageScore = averageScoreRows.length
      ? averageScoreRows.reduce((sum, row) => {
          if (row.score !== null && row.score !== undefined) return sum + Number(row.score);
          if (row.value_yes_no !== null && row.value_yes_no !== undefined) return sum + (Number(row.value_yes_no) ? 4 : 1);
          return sum;
        }, 0) / averageScoreRows.length
      : 0;

    const summary = {
      total_participants: records.length,
      total_evaluators: [...new Set(assignmentRows.map((row) => row.evaluator_id))].length,
      self_submitted: records.filter((r) => r.self_status === "submitted").length,
      self_draft: records.filter((r) => r.self_status === "draft").length,
      self_pending: records.filter((r) => r.self_status === "pending" || r.self_status === "not_started").length,
      committee_completed: records.filter((r) => r.stage === "completed").length,
      committee_in_progress: records.filter((r) => r.stage === "committee_in_progress").length,
      committee_pending: records.filter((r) => r.stage === "not_started" || r.stage === "self_draft").length,
      average_score: Number(averageScore.toFixed(2)),
    };

    const departmentMap = new Map();
    for (const item of records) {
      const key = item.department_name || "ไม่ระบุแผนก";
      if (!departmentMap.has(key)) {
        departmentMap.set(key, { department_name: key, total: 0, self_submitted: 0, completed: 0, pending: 0 });
      }
      const row = departmentMap.get(key);
      row.total += 1;
      if (item.self_status === "submitted") row.self_submitted += 1;
      if (item.stage === "completed") row.completed += 1;
      else row.pending += 1;
    }
    const departmentStats = [...departmentMap.values()].sort((a, b) => b.total - a.total).map((item) => ({
      ...item,
      self_rate: item.total > 0 ? Math.round((item.self_submitted / item.total) * 100) : 0,
      complete_rate: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
    }));

    // Page 1
    doc.fillColor("#0F172A").fontSize(24).text("รายงานภาพรวมการประเมิน", M, M, { width: 380 });
    doc.fillColor("#64748B").fontSize(10).text("สรุปสถานะรอบการประเมินแบบอ่านง่าย พร้อมแยกส่วนสำคัญให้พร้อมใช้งานทันที", M, M + 30, { width: 440 });
    card(W - M - 180, M, 180, 48, "#EEF2FF", "#C7D2FE");
    doc.fillColor("#4338CA").fontSize(8.5).text("รอบการประเมิน", W - M - 168, M + 8, { width: 156 });
    doc.fillColor("#1E1B4B").fontSize(12.5).text(period.name_th || `รอบ ${period.buddhist_year || "-"}`, W - M - 168, M + 20, { width: 156 });
    doc.fillColor("#64748B").fontSize(8.5).text(`จัดทำเมื่อ ${fmtDateTime(new Date())}`, W - M - 180, M + 54, { width: 180, align: "right" });

    const cardY = M + 74;
    const cardW = Math.floor((CW - 40) / 5);
    const cards = [
      { label: "ผู้เข้าร่วมทั้งหมด", value: summary.total_participants, fill: "#3730A3" },
      { label: "ส่งประเมินตนเองแล้ว", value: summary.self_submitted, fill: "#0F766E" },
      { label: "กรรมการครบ", value: summary.committee_completed, fill: "#059669" },
      { label: "ยังดำเนินการ", value: summary.self_pending + summary.committee_pending, fill: "#B45309" },
      { label: "คะแนนเฉลี่ย", value: summary.average_score.toFixed(2), fill: "#7C3AED" },
    ];
    cards.forEach((item, idx) => {
      const x = M + idx * (cardW + 10);
      card(x, cardY, cardW, 70, item.fill, item.fill);
      doc.fillColor("#FFFFFF").fontSize(9).text(item.label, x + 12, cardY + 12, { width: cardW - 24 });
      doc.fillColor("#FFFFFF").fontSize(20).text(String(item.value), x + 12, cardY + 28, { width: cardW - 24 });
    });

    const progressY = cardY + 88;
    card(M, progressY, CW, 66, "#F8FAFC", "#E2E8F0");
    doc.fillColor("#1E1B4B").fontSize(12).text("ความคืบหน้ารวมของรอบนี้", M + 14, progressY + 12, { width: 260 });
    doc.fillColor("#64748B").fontSize(9).text("คำนวณจากผู้ถูกประเมินที่ส่งแบบประเมินตนเองแล้วในรอบนี้", M + 14, progressY + 28, { width: 380 });
    progress(M + 14, progressY + 44, CW - 28, summary.self_submitted > 0 ? Math.round((summary.self_submitted / Math.max(1, summary.total_participants)) * 100) : 0, "#10B981");

    const deptY = progressY + 82;
    doc.fillColor("#1E1B4B").fontSize(14).text("ภาพรวมตามแผนก", M, deptY, { width: 220 });
    doc.fillColor("#64748B").fontSize(9).text("แผนกที่มีผู้เข้าร่วมมากที่สุดในรอบนี้", M, deptY + 18, { width: 220 });
    let rowY = deptY + 36;
    departmentStats.slice(0, 8).forEach((dept, idx) => {
      card(M, rowY, CW, 34, idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC", "#E2E8F0");
      doc.fillColor("#0F172A").fontSize(10.5).text(dept.department_name, M + 12, rowY + 8, { width: 178 });
      doc.fillColor("#64748B").fontSize(8.5).text(`${dept.total} คน`, M + 194, rowY + 9, { width: 48 });
      doc.fillColor("#475569").fontSize(8.2).text("ส่งตนเอง", M + 256, rowY + 4, { width: 60 });
      progress(M + 256, rowY + 14, 146, dept.self_rate, "#10B981");
      doc.fillColor("#475569").fontSize(8.2).text("กรรมการ", M + 430, rowY + 4, { width: 60 });
      progress(M + 430, rowY + 14, 146, dept.complete_rate, "#4F46E5");
      rowY += 38;
    });

    // Page 2
    doc.addPage({ size: "A4", layout: "landscape", margin: M });
    doc.fillColor("#0F172A").fontSize(18).text("รายชื่อผู้ถูกประเมิน", M, M, { width: 250 });
    doc.fillColor("#64748B").fontSize(10).text("แสดงสถานะและความคืบหน้าของแต่ละคนแบบการ์ด เพื่ออ่านง่ายกว่าตาราง", M, M + 22, { width: 380 });

    const cardWidth = (CW - 12) / 2;
    const cardHeight = 110;
    let x = M;
    let y = M + 42;
    const colorMap = { not_started: "#64748B", self_draft: "#F59E0B", committee_in_progress: "#4F46E5", completed: "#10B981" };

    records.forEach((item) => {
      if (y + cardHeight > H - M - 8) {
        doc.addPage({ size: "A4", layout: "landscape", margin: M });
        x = M;
        y = M + 10;
      }

      card(x, y, cardWidth, cardHeight, "#FFFFFF", "#E2E8F0");
      card(x, y, cardWidth, 9, colorMap[item.stage] || "#7C3AED", colorMap[item.stage] || "#7C3AED");
      pill(x + cardWidth - 118, y + 14, stageMeta[item.stage]?.label || "ยังไม่เริ่ม", stageMeta[item.stage]?.fill || "#64748B");
      doc.fillColor("#0F172A").fontSize(13.5).text(item.evaluatee_name || "-", x + 14, y + 16, { width: cardWidth - 140 });
      doc.fillColor("#64748B").fontSize(9).text(`${item.department_name || "ไม่ระบุแผนก"} · ${item.position || "ไม่ระบุตำแหน่ง"}`, x + 14, y + 35, { width: cardWidth - 28 });
      doc.fillColor("#475569").fontSize(9).text(`การประเมินตนเอง: ${item.self_status === "submitted" ? "ส่งแล้ว" : item.self_status === "draft" ? "ฉบับร่าง" : "รอดำเนินการ"}`, x + 14, y + 54, { width: 170 });
      doc.fillColor("#475569").fontSize(9).text(`กรรมการ: ${item.stage === "completed" ? "ครบแล้ว" : item.stage === "committee_in_progress" ? "กำลังประเมิน" : "รอดำเนินการ"}`, x + 14, y + 68, { width: 170 });
      doc.fillColor("#475569").fontSize(9).text(`อัปเดตล่าสุด: ${fmtDateTime(item.last_activity_at)}`, x + 14, y + 82, { width: cardWidth - 28 });
      progress(x + cardWidth - 130, y + 52, 110, item.self_progress, "#10B981");
      progress(x + cardWidth - 130, y + 73, 110, item.committee_progress, "#4F46E5");

      if (x === M) x = M + cardWidth + 12;
      else {
        x = M;
        y += cardHeight + 12;
      }
    });

    doc.end();
  } catch (error) {
    console.error("PDF Error:", error);
    if (!res.headersSent) {
      res.status(500).send("เกิดข้อผิดพลาดในการสร้างรายงาน");
    }
  }
};


exports.create_cat = async (req, res) => {
  try {
    const { code, name_th, created_at } = req.body;
    await db('vocational_categories').insert({
      code,
      name_th,
      created_at
    });
    res.json({ message: "สร้างหมวดหมู่เรียบร้อย" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};


// แก้ไข cat
exports.update_cat = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_th } = req.body;


    await db("vocational_categories")
      .where({ id })
      .update({
        code,
        name_th
      });

    res.json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ลบ cat
exports.remove_cat = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteData = await db("vocational_categories")
      .where({ id: id })
      .del();
    res.json({ message: deleteData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5.1.10 แสดงผลสรุปการประเมินรายกรรมการ (ประเมินผู้รับการประเมินแต่ละคน)
exports.evaluator_tracking = async (req, res) => {
  try {
    const { search = "", department_id = "", position = "", period_id } = req.query || {};
    let targetPeriodId = Number(period_id);

    if (!targetPeriodId) {
      const activePeriod = await db("evaluation_periods")
        .select("id")
        .where({ is_active: 1 })
        .orderBy("id", "desc")
        .first();

      targetPeriodId = activePeriod?.id || null;
    }

    if (!targetPeriodId) {
      return res.status(400).json({ success: false, message: "กรุณาระบุรอบการประเมิน" });
    }

    const period = await db("evaluation_periods").where({ id: targetPeriodId }).first();
    if (!period) {
      return res.status(404).json({ success: false, message: "ไม่พบรอบการประเมิน" });
    }

    const totalIndicatorsRow = await db("indicators").where({ active: 1 }).count({ total: "*" }).first();
    const totalIndicators = Number(totalIndicatorsRow?.total || 0);

    const assignmentsQuery = db("assignments as a")
      .join("users as evalr", "evalr.id", "a.evaluator_id")
      .join("users as evale", "evale.id", "a.evaluatee_id")
      .leftJoin("departments as d", "d.id", "evalr.department_id")
      .select(
        "a.id as assignment_id",
        "a.period_id",
        "a.evaluator_id",
        "a.evaluatee_id",
        "a.evaluator_role",
        "a.evaluator_status",
        "a.evaluator_signed_at",
        "a.acknowledge_signed_at",
        "a.created_at as assignment_created_at",
        "evalr.name_th as evaluator_name",
        "evalr.email as evaluator_email",
        "evale.name_th as evaluatee_name",
        "evale.email as evaluatee_email",
        "d.name_th as department_name",
        "evalr.position as evaluator_position"
      )
      .where("a.period_id", targetPeriodId);

    if (department_id) assignmentsQuery.where("evalr.department_id", Number(department_id));
    if (position) assignmentsQuery.where("evalr.position", "like", `%${position}%`);
    if (search.trim()) {
      const like = `%${search.trim().toLowerCase()}%`;
      assignmentsQuery.where(function () {
        this.whereRaw("LOWER(evalr.name_th) LIKE ?", [like])
          .orWhereRaw("LOWER(evalr.email) LIKE ?", [like])
          .orWhereRaw("LOWER(evale.name_th) LIKE ?", [like])
          .orWhereRaw("LOWER(evale.email) LIKE ?", [like]);
      });
    }

    const assignments = await assignmentsQuery.orderBy("evalr.name_th", "asc").orderBy("evale.name_th", "asc");

    const resultRows = await db("evaluation_results as er")
      .where({ "er.period_id": targetPeriodId })
      .select(
        "er.evaluator_id",
        "er.evaluatee_id",
        db.raw("COUNT(DISTINCT er.indicator_id) as attempted_count"),
        db.raw("SUM(CASE WHEN er.status = 'submitted' THEN 1 ELSE 0 END) as submitted_count"),
        db.raw("SUM(CASE WHEN er.status = 'draft' THEN 1 ELSE 0 END) as draft_count"),
        db.raw("MAX(er.updated_at) as last_result_at")
      )
      .groupBy("er.evaluator_id", "er.evaluatee_id");

    const resultMap = new Map(resultRows.map((row) => [
      `${row.evaluator_id}:${row.evaluatee_id}`,
      {
        attempted_count: Number(row.attempted_count || 0),
        submitted_count: Number(row.submitted_count || 0),
        draft_count: Number(row.draft_count || 0),
        last_result_at: row.last_result_at,
      },
    ]));

    const evaluatorMap = new Map();
    for (const asg of assignments) {
      if (!evaluatorMap.has(asg.evaluator_id)) {
        evaluatorMap.set(asg.evaluator_id, {
          evaluator_id: asg.evaluator_id,
          evaluator_name: asg.evaluator_name,
          evaluator_email: asg.evaluator_email,
          department_name: asg.department_name,
          position: asg.evaluator_position,
          total_assignments: 0,
          completed_assignments: 0,
          in_progress_assignments: 0,
          pending_assignments: 0,
          total_submitted_indicators: 0,
          total_attempted_indicators: 0,
          total_expected_indicators: 0,
          last_activity_at: null,
          assignments: [],
        });
      }

      const evaluator = evaluatorMap.get(asg.evaluator_id);
      const result = resultMap.get(`${asg.evaluator_id}:${asg.evaluatee_id}`) || {
        attempted_count: 0,
        submitted_count: 0,
        draft_count: 0,
        last_result_at: null,
      };

      const submittedCount = Number(result.submitted_count || 0);
      const attemptedCount = Number(result.attempted_count || 0);
      const progress = totalIndicators > 0 ? Math.min(100, Math.round((submittedCount / totalIndicators) * 100)) : 0;

      let status = "pending";
      if (asg.evaluator_status === "completed" || (submittedCount >= totalIndicators && totalIndicators > 0)) status = "completed";
      else if (asg.evaluator_status === "evaluating" || attemptedCount > 0 || submittedCount > 0 || result.draft_count > 0) status = "evaluating";

      evaluator.total_assignments += 1;
      evaluator.total_submitted_indicators += submittedCount;
      evaluator.total_attempted_indicators += attemptedCount;
      evaluator.total_expected_indicators += totalIndicators;
      if (status === "completed") evaluator.completed_assignments += 1;
      else if (status === "evaluating") evaluator.in_progress_assignments += 1;
      else evaluator.pending_assignments += 1;

      const latestActivity = result.last_result_at || asg.acknowledge_signed_at || asg.evaluator_signed_at || asg.assignment_created_at;
      if (!evaluator.last_activity_at || (latestActivity && new Date(latestActivity) > new Date(evaluator.last_activity_at))) {
        evaluator.last_activity_at = latestActivity;
      }

      evaluator.assignments.push({
        assignment_id: asg.assignment_id,
        evaluatee_id: asg.evaluatee_id,
        evaluatee_name: asg.evaluatee_name,
        evaluatee_email: asg.evaluatee_email,
        evaluator_role: asg.evaluator_role,
        evaluator_status: status,
        raw_status: asg.evaluator_status,
        submitted_count: submittedCount,
        attempted_count: attemptedCount,
        draft_count: Number(result.draft_count || 0),
        total_indicators: totalIndicators,
        progress,
        last_activity_at: latestActivity,
      });
    }

    const evaluators = Array.from(evaluatorMap.values())
      .map((item) => ({
        ...item,
        overall_progress: item.total_expected_indicators > 0
          ? Math.round((item.total_submitted_indicators / item.total_expected_indicators) * 100)
          : 0,
      }))
      .sort((a, b) => a.evaluator_name.localeCompare(b.evaluator_name, "th"));

    const summary = {
      total_evaluators: evaluators.length,
      total_assignments: assignments.length,
      completed_assignments: evaluators.reduce((sum, ev) => sum + ev.completed_assignments, 0),
      in_progress_assignments: evaluators.reduce((sum, ev) => sum + ev.in_progress_assignments, 0),
      pending_assignments: evaluators.reduce((sum, ev) => sum + ev.pending_assignments, 0),
      total_indicators: totalIndicators,
      overall_progress: assignments.length > 0 && totalIndicators > 0
        ? Math.round((evaluators.reduce((sum, ev) => sum + ev.total_submitted_indicators, 0) / (assignments.length * totalIndicators)) * 100)
        : 0,
    };

    res.json({ success: true, period, summary, evaluators });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.evaluatee_tracking = async (req, res) => {
  try {
    const { search = "", department_id = "", position = "", period_id } = req.query || {};
    let targetPeriodId = Number(period_id);

    if (!targetPeriodId) {
      const activePeriod = await db("evaluation_periods")
        .select("id")
        .where({ is_active: 1 })
        .orderBy("id", "desc")
        .first();

      targetPeriodId = activePeriod?.id || null;
    }

    if (!targetPeriodId) {
      return res.status(400).json({ success: false, message: "กรุณาระบุรอบการประเมิน" });
    }

    const period = await db("evaluation_periods").where({ id: targetPeriodId }).first();
    if (!period) {
      return res.status(404).json({ success: false, message: "ไม่พบรอบการประเมิน" });
    }

    const totalIndicatorsRow = await db("indicators").where({ active: 1 }).count({ total: "*" }).first();
    const totalIndicators = Number(totalIndicatorsRow?.total || 0);

    const evaluateeQuery = db("users as u")
      .leftJoin("departments as d", "d.id", "u.department_id")
      .select(
        "u.id",
        "u.name_th as evaluatee_name",
        "u.email as evaluatee_email",
        "d.name_th as department_name",
        "u.position"
      )
      .where("u.role", "evaluatee");

    if (department_id) evaluateeQuery.where("u.department_id", Number(department_id));
    if (position) evaluateeQuery.where("u.position", "like", `%${position}%`);
    if (search.trim()) {
      const like = `%${search.trim().toLowerCase()}%`;
      evaluateeQuery.where(function () {
        this.whereRaw("LOWER(u.name_th) LIKE ?", [like])
          .orWhereRaw("LOWER(u.email) LIKE ?", [like]);
      });
    }

    const evaluatees = await evaluateeQuery.orderBy("u.name_th", "asc");
    const evaluateeIds = evaluatees.map((u) => u.id);

    const selfSubmissionRows = evaluateeIds.length
      ? await db("self_eval_submissions as ses")
          .where("ses.period_id", targetPeriodId)
          .whereIn("ses.evaluatee_id", evaluateeIds)
          .select(
            "ses.evaluatee_id",
            "ses.status",
            "ses.signature",
            "ses.signed_at",
            "ses.updated_at"
          )
      : [];

    const selfResultRows = evaluateeIds.length
      ? await db("self_evaluation_results as ser")
          .where("ser.period_id", targetPeriodId)
          .whereIn("ser.evaluatee_id", evaluateeIds)
          .select(
            "ser.evaluatee_id",
            db.raw("COUNT(DISTINCT ser.indicator_id) as attempted_count"),
            db.raw("SUM(CASE WHEN ser.status = 'submitted' THEN 1 ELSE 0 END) as submitted_count"),
            db.raw("SUM(CASE WHEN ser.status = 'draft' THEN 1 ELSE 0 END) as draft_count"),
            db.raw("MAX(ser.updated_at) as last_self_activity_at")
          )
          .groupBy("ser.evaluatee_id")
      : [];

    const assignmentsQuery = evaluateeIds.length
      ? db("assignments as a")
          .join("users as evalr", "evalr.id", "a.evaluator_id")
          .join("users as evale", "evale.id", "a.evaluatee_id")
          .select(
            "a.id as assignment_id",
            "a.period_id",
            "a.evaluator_id",
            "a.evaluatee_id",
            "a.evaluator_role",
            "a.evaluator_status",
            "a.evaluator_signed_at",
            "a.acknowledge_signed_at",
            "a.created_at as assignment_created_at",
            "evalr.name_th as evaluator_name",
            "evalr.email as evaluator_email",
            "evale.name_th as evaluatee_name",
            "evale.email as evaluatee_email"
          )
          .where("a.period_id", targetPeriodId)
          .whereIn("a.evaluatee_id", evaluateeIds)
      : db("assignments as a").whereRaw("1 = 0");

    if (search.trim()) {
      const like = `%${search.trim().toLowerCase()}%`;
      assignmentsQuery.where(function () {
        this.whereRaw("LOWER(evale.name_th) LIKE ?", [like])
          .orWhereRaw("LOWER(evale.email) LIKE ?", [like])
          .orWhereRaw("LOWER(evalr.name_th) LIKE ?", [like])
          .orWhereRaw("LOWER(evalr.email) LIKE ?", [like]);
      });
    }

    const assignments = await assignmentsQuery
      .orderBy("evale.name_th", "asc")
      .orderBy("evalr.name_th", "asc");

    const resultRows = await db("evaluation_results as er")
      .where({ "er.period_id": targetPeriodId })
      .whereIn("er.evaluatee_id", evaluateeIds)
      .select(
        "er.evaluatee_id",
        "er.evaluator_id",
        db.raw("COUNT(DISTINCT er.indicator_id) as attempted_count"),
        db.raw("SUM(CASE WHEN er.status = 'submitted' THEN 1 ELSE 0 END) as submitted_count"),
        db.raw("SUM(CASE WHEN er.status = 'draft' THEN 1 ELSE 0 END) as draft_count"),
        db.raw("MAX(er.updated_at) as last_result_at")
      )
      .groupBy("er.evaluatee_id", "er.evaluator_id");

    const selfSubmissionMap = new Map(selfSubmissionRows.map((row) => [
      row.evaluatee_id,
      {
        status: row.status || "draft",
        signature: row.signature || null,
        signed_at: row.signed_at || null,
        updated_at: row.updated_at || null,
      },
    ]));

    const selfResultMap = new Map(selfResultRows.map((row) => [
      row.evaluatee_id,
      {
        attempted_count: Number(row.attempted_count || 0),
        submitted_count: Number(row.submitted_count || 0),
        draft_count: Number(row.draft_count || 0),
        last_self_activity_at: row.last_self_activity_at || null,
      },
    ]));

    const resultMap = new Map(resultRows.map((row) => [
      `${row.evaluatee_id}:${row.evaluator_id}`,
      {
        attempted_count: Number(row.attempted_count || 0),
        submitted_count: Number(row.submitted_count || 0),
        draft_count: Number(row.draft_count || 0),
        last_result_at: row.last_result_at || null,
      },
    ]));

    const evaluateeMap = new Map();
    for (const user of evaluatees) {
      const selfSubmission = selfSubmissionMap.get(user.id) || {
        status: "not_started",
        signature: null,
        signed_at: null,
        updated_at: null,
      };
      const selfResults = selfResultMap.get(user.id) || {
        attempted_count: 0,
        submitted_count: 0,
        draft_count: 0,
        last_self_activity_at: null,
      };

      evaluateeMap.set(user.id, {
        evaluatee_id: user.id,
        evaluatee_name: user.evaluatee_name,
        evaluatee_email: user.evaluatee_email,
        department_name: user.department_name,
        position: user.position,
        self_eval_status: selfSubmission.status,
        self_eval_signature: selfSubmission.signature,
        self_eval_signed_at: selfSubmission.signed_at,
        self_eval_last_activity_at: selfResults.last_self_activity_at || selfSubmission.updated_at || selfSubmission.signed_at || null,
        self_eval_attempted_indicators: selfResults.attempted_count,
        self_eval_submitted_indicators: selfResults.submitted_count,
        self_eval_draft_indicators: selfResults.draft_count,
        self_eval_progress: totalIndicators > 0
          ? Math.round((selfResults.submitted_count / totalIndicators) * 100)
          : 0,
        total_assignments: 0,
        completed_assignments: 0,
        in_progress_assignments: 0,
        pending_assignments: 0,
        committee_progress: 0,
        last_activity_at: selfResults.last_self_activity_at || selfSubmission.updated_at || selfSubmission.signed_at || null,
        evaluators: [],
      });
    }

    for (const asg of assignments) {
      const evaluatee = evaluateeMap.get(asg.evaluatee_id);
      if (!evaluatee) continue;

      const result = resultMap.get(`${asg.evaluatee_id}:${asg.evaluator_id}`) || {
        attempted_count: 0,
        submitted_count: 0,
        draft_count: 0,
        last_result_at: null,
      };

      const submittedCount = Number(result.submitted_count || 0);
      const attemptedCount = Number(result.attempted_count || 0);
      const progress = totalIndicators > 0
        ? Math.min(100, Math.round((submittedCount / totalIndicators) * 100))
        : 0;

      let status = "pending";
      if (asg.evaluator_status === "completed" || (submittedCount >= totalIndicators && totalIndicators > 0)) {
        status = "completed";
      } else if (
        asg.evaluator_status === "evaluating" ||
        attemptedCount > 0 ||
        submittedCount > 0 ||
        result.draft_count > 0
      ) {
        status = "evaluating";
      }

      evaluatee.total_assignments += 1;
      evaluatee.total_submitted_indicators = (evaluatee.total_submitted_indicators || 0) + submittedCount;
      evaluatee.total_attempted_indicators = (evaluatee.total_attempted_indicators || 0) + attemptedCount;
      evaluatee.total_expected_indicators = (evaluatee.total_expected_indicators || 0) + totalIndicators;

      if (status === "completed") evaluatee.completed_assignments += 1;
      else if (status === "evaluating") evaluatee.in_progress_assignments += 1;
      else evaluatee.pending_assignments += 1;

      const latestActivity = result.last_result_at || asg.acknowledge_signed_at || asg.evaluator_signed_at || asg.assignment_created_at;
      if (!evaluatee.last_activity_at || (latestActivity && new Date(latestActivity) > new Date(evaluatee.last_activity_at))) {
        evaluatee.last_activity_at = latestActivity;
      }

      evaluatee.evaluators.push({
        assignment_id: asg.assignment_id,
        evaluator_id: asg.evaluator_id,
        evaluator_name: asg.evaluator_name,
        evaluator_email: asg.evaluator_email,
        evaluator_role: asg.evaluator_role,
        evaluator_status: status,
        raw_status: asg.evaluator_status,
        submitted_count: submittedCount,
        attempted_count: attemptedCount,
        draft_count: Number(result.draft_count || 0),
        total_indicators: totalIndicators,
        progress,
        last_activity_at: latestActivity,
      });
    }

    const evaluateesWithTracking = Array.from(evaluateeMap.values())
      .map((item) => {
        const committeeProgress = item.total_assignments > 0
          ? Math.round((item.completed_assignments / item.total_assignments) * 100)
          : 0;
        const stage = item.self_eval_status === "submitted"
          ? (item.total_assignments === 0
            ? "waiting_committee"
            : item.completed_assignments === item.total_assignments && item.total_assignments > 0
              ? "completed"
              : item.in_progress_assignments > 0
                ? "committee_in_progress"
                : "committee_pending")
          : item.self_eval_status === "draft"
            ? "self_draft"
            : "not_started";

        return {
          ...item,
          committee_progress: committeeProgress,
          stage,
          evaluators: item.evaluators.sort((a, b) => a.evaluator_name.localeCompare(b.evaluator_name, "th")),
        };
      })
      .sort((a, b) => a.evaluatee_name.localeCompare(b.evaluatee_name, "th"));

    const summary = {
      total_evaluatees: evaluateesWithTracking.length,
      self_submitted: evaluateesWithTracking.filter((item) => item.self_eval_status === "submitted").length,
      committee_completed: evaluateesWithTracking.filter((item) => item.stage === "completed").length,
      committee_in_progress: evaluateesWithTracking.filter((item) => item.stage === "committee_in_progress").length,
      waiting_committee: evaluateesWithTracking.filter((item) => item.stage === "waiting_committee" || item.stage === "committee_pending").length,
      not_started: evaluateesWithTracking.filter((item) => item.stage === "not_started" || item.stage === "self_draft").length,
      total_assignments: assignments.length,
      overall_committee_progress: evaluateesWithTracking.length > 0
        ? Math.round(
            evaluateesWithTracking.reduce((sum, item) => sum + item.committee_progress, 0) /
              evaluateesWithTracking.length
          )
        : 0,
    };

    res.json({ success: true, period, summary, evaluatees: evaluateesWithTracking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.summary_by_evaluator = async (req, res) => {
  try {
    const { evaluatee_id, period_id } = req.query;
    if (!evaluatee_id || !period_id) {
      return res.status(400).json({ message: "กรุณาระบุ evaluatee_id และ period_id" });
    }

    // 1. ดึงผู้ประเมินทั้งหมดที่เกี่ยวข้องกับครูคนนี้ในรอบนี้
    const evaluatorsList = await db("assignments as a")
      .join("users as u", "u.id", "a.evaluator_id")
      .where({
        "a.evaluatee_id": evaluatee_id,
        "a.period_id": period_id
      })
      .select(
        "a.evaluator_id",
        "u.name_th as evaluator_name",
        "a.evaluator_role",
        "a.evaluator_status"
      );

    // 2. ดึงผลการประเมินทั้งหมดของครูคนนี้ในรอบนี้
    const scores = await db("evaluation_results")
      .where({
        evaluatee_id,
        period_id
      })
      .select(
        "evaluator_id",
        "indicator_id",
        "score",
        "value_yes_no",
        "notes",
        "status"
      );

    // 3. ดึงตัวชี้วัดทั้งหมด
    const indicators = await db("indicators")
      .where("active", 1)
      .select("id", "code", "name_th", "type")
      .orderBy("code", "asc");

    // 4. จัด format ข้อมูลสรุปเปรียบเทียบตามตัวชี้วัด
    const formattedIndicators = indicators.map(ind => {
      const evaluatorScores = {};
      evaluatorsList.forEach(evalr => {
        const found = scores.find(s => s.indicator_id === ind.id && s.evaluator_id === evalr.evaluator_id);
        evaluatorScores[evalr.evaluator_id] = found ? {
          score: found.score,
          value_yes_no: found.value_yes_no === null ? null : !!found.value_yes_no,
          notes: found.notes || "",
          status: found.status
        } : null;
      });
      return {
        id: ind.id,
        code: ind.code,
        name_th: ind.name_th,
        type: ind.type,
        scores: evaluatorScores
      };
    });

    res.json({
      success: true,
      evaluators: evaluatorsList,
      indicators: formattedIndicators
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.individual_report = async (req, res) => {
  try {
    const { evaluatee_id, period_id } = req.query;
    if (!evaluatee_id || !period_id) {
      return res.status(400).json({ message: "กรุณาระบุ evaluatee_id และ period_id" });
    }

    const period = await db("evaluation_periods").where({ id: period_id }).first();
    if (!period) {
      return res.status(404).json({ message: "ไม่พบรอบการประเมิน" });
    }

    const evaluatee = await db("users as u")
      .leftJoin("departments as d", "d.id", "u.department_id")
      .select(
        "u.id",
        "u.name_th as evaluatee_name",
        "u.email as evaluatee_email",
        "u.role",
        "u.status as user_status",
        "d.name_th as department_name",
        "u.position"
      )
      .where("u.id", evaluatee_id)
      .first();

    if (!evaluatee) {
      return res.status(404).json({ message: "ไม่พบผู้ถูกประเมิน" });
    }

    const indicators = await db("indicators as i")
      .join("evaluation_topics as t", "t.id", "i.topic_id")
      .select(
        "t.id as topic_id",
        "t.title_th as topic_title",
        "i.id as indicator_id",
        "i.code as indicator_code",
        "i.name_th as indicator_name",
        "i.type as indicator_type",
        "i.min_score",
        "i.max_score",
      )
      .where("i.active", 1)
      .orderBy(["t.id", "i.id"]);

    const selfSubmission = await db("self_eval_submissions")
      .where({ period_id, evaluatee_id })
      .first();

    const selfRows = await db("self_evaluation_results as ser")
      .where({ "ser.period_id": period_id, "ser.evaluatee_id": evaluatee_id })
      .select(
        "ser.indicator_id",
        "ser.topic_id",
        "ser.score",
        "ser.value_yes_no",
        "ser.notes",
        "ser.status",
        "ser.updated_at"
      );

    const assignments = await db("assignments as a")
      .join("users as u", "u.id", "a.evaluator_id")
      .where({ "a.period_id": period_id, "a.evaluatee_id": evaluatee_id })
      .select(
        "a.id as assignment_id",
        "a.evaluator_id",
        "a.evaluator_role",
        "a.evaluator_status",
        "a.evaluator_signed_at",
        "a.acknowledge_signed_at",
        "a.created_at as assignment_created_at",
        "u.name_th as evaluator_name",
        "u.email as evaluator_email"
      )
      .orderBy("u.name_th", "asc");

    const committeeRows = await db("evaluation_results as er")
      .join("users as u", "u.id", "er.evaluator_id")
      .where({ "er.period_id": period_id, "er.evaluatee_id": evaluatee_id })
      .select(
        "er.indicator_id",
        "er.evaluator_id",
        "er.score",
        "er.value_yes_no",
        "er.notes",
        "er.status",
        "er.updated_at",
        "u.name_th as evaluator_name",
        "u.email as evaluator_email"
      );

    const selfMap = new Map(selfRows.map((row) => [row.indicator_id, row]));
    const committeeMap = new Map();
    for (const row of committeeRows) {
      if (!committeeMap.has(row.indicator_id)) {
        committeeMap.set(row.indicator_id, []);
      }
      committeeMap.get(row.indicator_id).push(row);
    }

    const evaluatorMap = new Map();
    for (const asg of assignments) {
      const row = committeeRows.filter((r) => r.evaluator_id === asg.evaluator_id);
      const submittedCount = row.filter((r) => r.status === "submitted").length;
      const lastActivity = row.reduce((latest, current) => {
        if (!latest) return current.updated_at;
        return new Date(current.updated_at) > new Date(latest) ? current.updated_at : latest;
      }, asg.acknowledge_signed_at || asg.evaluator_signed_at || asg.assignment_created_at || null);

      evaluatorMap.set(asg.evaluator_id, {
        ...asg,
        submitted_indicators: submittedCount,
        total_indicators: indicators.length,
        progress: indicators.length > 0 ? Math.round((submittedCount / indicators.length) * 100) : 0,
        last_activity_at: lastActivity,
      });
    }

    const indicatorRows = indicators.map((ind) => {
      const selfResult = selfMap.get(ind.indicator_id) || null;
      const rows = committeeMap.get(ind.indicator_id) || [];
      const submittedRows = rows.filter((row) => row.status === "submitted");
      const committeeScores = assignments.map((ev) => {
        const found = rows.find((row) => row.evaluator_id === ev.evaluator_id);
        return found ? {
          evaluator_id: ev.evaluator_id,
          evaluator_name: ev.evaluator_name,
          evaluator_email: ev.evaluator_email,
          evaluator_role: ev.evaluator_role,
          score: found.score,
          value_yes_no: found.value_yes_no === null ? null : !!found.value_yes_no,
          notes: found.notes || "",
          status: found.status,
          updated_at: found.updated_at,
        } : {
          evaluator_id: ev.evaluator_id,
          evaluator_name: ev.evaluator_name,
          evaluator_email: ev.evaluator_email,
          evaluator_role: ev.evaluator_role,
          score: null,
          value_yes_no: null,
          notes: "",
          status: "draft",
          updated_at: null,
        };
      });

      const scoreRows = submittedRows.filter((row) => row.score !== null && row.score !== undefined);
      const yesNoRows = submittedRows.filter((row) => row.value_yes_no !== null && row.value_yes_no !== undefined);
      const avgScore = scoreRows.length
        ? Number((scoreRows.reduce((sum, row) => sum + Number(row.score || 0), 0) / scoreRows.length).toFixed(2))
        : null;
      const avgYesNo = yesNoRows.length
        ? Math.round((yesNoRows.reduce((sum, row) => sum + (Number(row.value_yes_no) ? 1 : 0), 0) / yesNoRows.length) * 100)
        : null;

      return {
        ...ind,
        self_result: selfResult
          ? {
              score: selfResult.score,
              value_yes_no: selfResult.value_yes_no === null ? null : !!selfResult.value_yes_no,
              notes: selfResult.notes || "",
              status: selfResult.status,
              updated_at: selfResult.updated_at,
            }
          : null,
        committee_scores: committeeScores,
        committee_submitted_count: submittedRows.length,
        committee_total_count: assignments.length,
        committee_avg_score: avgScore,
        committee_avg_yes_no: avgYesNo,
      };
    });

    const selfSubmittedCount = selfRows.filter((row) => row.status === "submitted").length;
    const committeeSubmittedCount = committeeRows.filter((row) => row.status === "submitted").length;

    const summary = {
      self_status: selfSubmission?.status || "pending",
      self_submitted_count: selfSubmittedCount,
      self_total_count: indicators.length,
      self_progress: indicators.length > 0 ? Math.round((selfSubmittedCount / indicators.length) * 100) : 0,
      committee_completed: assignments.filter((item) => item.evaluator_status === "completed").length,
      committee_pending: assignments.filter((item) => item.evaluator_status !== "completed").length,
      committee_total_count: assignments.length,
      committee_submitted_count: committeeSubmittedCount,
      committee_progress: assignments.length > 0 && indicators.length > 0
        ? Math.round((committeeSubmittedCount / (assignments.length * indicators.length)) * 100)
        : 0,
      overall_status: !selfSubmission
        ? "ยังไม่เริ่ม"
        : selfSubmission.status === "submitted" && assignments.length > 0 && assignments.every((a) => a.evaluator_status === "completed")
          ? "ประเมินครบแล้ว"
          : selfSubmission.status === "submitted"
            ? "รอกรรมการ"
            : "กำลังทำ self-evaluation",
      last_activity_at: indicatorRows.reduce((latest, ind) => {
        const times = [
          ind.self_result?.updated_at || null,
          ...(ind.committee_scores || []).map((r) => r.updated_at).filter(Boolean),
        ].filter(Boolean);
        const localLatest = times.reduce((acc, curr) => {
          if (!acc) return curr;
          return new Date(curr) > new Date(acc) ? curr : acc;
        }, null);
        if (!latest) return localLatest;
        if (!localLatest) return latest;
        return new Date(localLatest) > new Date(latest) ? localLatest : latest;
      }, selfSubmission?.signed_at || null),
    };

    res.json({
      success: true,
      period,
      evaluatee: {
        ...evaluatee,
        self_submission: selfSubmission || null,
      },
      summary,
      evaluators: Array.from(evaluatorMap.values()),
      indicators: indicatorRows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ดึงจำนวนผู้ใช้งานที่กำลังออนไลน์
exports.get_online_count = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    // เช็คก่อนว่ามีคอลัมน์นี้หรือไม่ ป้องกันการพังถ้ารันโค้ดก่อนเพิ่มฟิลด์ใน DB
    const hasColumn = await db.schema.hasColumn("users", "last_active_at");
    if (!hasColumn) {
      return res.json({ success: true, total: 1, admin: 1, evaluator: 0, evaluatee: 0 });
    }

    const onlineUsers = await db("users")
      .where("last_active_at", ">=", fiveMinutesAgo)
      .select("role");

    const total = onlineUsers.length;
    const admin = onlineUsers.filter((u) => u.role === "admin").length;
    const evaluator = onlineUsers.filter((u) => u.role === "evaluator").length;
    const evaluatee = onlineUsers.filter((u) => u.role === "evaluatee").length;

    return res.json({ success: true, total, admin, evaluator, evaluatee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ดึงรายการประวัติการเข้าใช้งานระบบ (Login logs)
exports.list_login_logs = async (req, res) => {
  try {
    // เช็คก่อนว่ามีตารางนี้หรือไม่ ป้องกันระบบล่ม
    const hasTable = await db.schema.hasTable("login_logs");
    if (!hasTable) {
      return res.json({ success: true, data: [], total: 0, page: 1, limit: 10 });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";

    let query = db("login_logs");

    if (search) {
      query = query.where("username", "like", `%${search}%`);
    }
    if (role) {
      query = query.where({ role });
    }
    if (status) {
      query = query.where({ status });
    }

    const totalResult = await query.clone().count("id as count").first();
    const total = totalResult ? parseInt(totalResult.count) : 0;

    const data = await query
      .select("*")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    res.json({ success: true, data, total, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
