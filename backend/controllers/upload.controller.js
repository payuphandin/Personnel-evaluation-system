const path = require("path");
const fs = require("fs");
const attRepo = require("../repositories/attachments");
const mapRepo = require("../repositories/indicatorEvidence");
const db = require("../db/knex");

// ---------- helpers ----------
function safeUnlink(abs) {
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
}
function relFromUploads(absPath) {
  // ให้ได้ path แบบ relative ต่อโฟลเดอร์ uploads และใช้ slash เดียว
  return path
    .relative(path.join(__dirname, "..", "uploads"), absPath)
    .replace(/\\/g, "/");
}
async function isPeriodActive(period_id) {
  const now = new Date();
  try {
    await db("evaluation_periods")
      .where("is_active", 1)
      .andWhere("end_date", "<", now)
      .update({ is_active: 0 });
  } catch {}

  const row = await db("evaluation_periods")
    .where({ id: period_id, is_active: 1 })
    .first();
  if (!row) return false;

  const start = new Date(row.start_date);
  const end = new Date(row.end_date);
  return now >= start && now <= end;
}

// =====================================================================
// Evaluatee: CREATE (อัปโหลดหลักฐานของตัวเอง)
// Body: { period_id, indicator_id, evidence_type_id } + file
// =====================================================================
exports.uploadEvidence = async (req, res, next) => {
  console.log("uploadEvidence body=", req.body);
  console.log("uploadEvidence file=", req.file);
  console.log("uploadEvidence user=", req.user);
  console.log("uploadEvidence user.id=", req.user?.id);
  console.log("uploadEvidence user.role=", req.user?.role);
  console.log("uploadEvidence user.email=", req.user?.email);
  try {
    const evaluatee_id = Number(req.user?.id);
    if (!evaluatee_id)
      return res.status(401).json({ success: false, message: "invalid user" });
    
    // 1. รับค่าที่ส่งมาจาก Frontend เพิ่มเติม (upload_mode, link_url, link_title)
    const { 
      period_id, 
      indicator_id, 
      evidence_type_id, 
      upload_mode, // 'file' หรือ 'link'
      link_url, 
      link_title 
    } = req.body || {};

    if (!period_id || !indicator_id || !evidence_type_id) {
      return res.status(400).json({
        success: false,
        message: "missing period_id/indicator_id/evidence_type_id",
      });
    }

    // 2. ตรวจสอบเงื่อนไขแยกตามโหมดการส่งข้อมูล
    let attachment_type = "file";
    let file_name = null;
    let mime_type = null;
    let size_bytes = null;
    let storage_path = null;

    if (upload_mode === "link" || link_url) {
      // โหมดแนบลิงก์
      attachment_type = "link";
      if (!link_url) {
        return res.status(400).json({ 
          success: false, 
          message: "ไม่ได้ส่ง link_url มาด้วย" 
        });
      }
      
      storage_path = link_url; // เก็บตัว URL ลงใน storage_path
      file_name = link_title || "ลิงก์หลักฐานแนบ"; // ชื่อแสดงผลของลิงก์
      mime_type = null;
      size_bytes = null;
    } else {
      // โหมดอัปโหลดไฟล์ปกติ
      attachment_type = "file";
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "ไม่ได้ส่ง file มาด้วย" 
        });
      }
      
      storage_path = relFromUploads(req.file.path);
      file_name = Buffer.from(req.file.originalname, "latin1").toString("utf8");
      mime_type = req.file.mimetype;
      size_bytes = req.file.size;
    }

    // period ต้องเปิดอยู่
    if (!(await isPeriodActive(Number(period_id)))) {
      return res.status(403).json({ success: false, message: "period closed" });
    }

    // mapping indicator-evidence_type ต้องถูกต้อง
    const okMap = await mapRepo.mapExists({
      indicator_id: Number(indicator_id),
      evidence_type_id: Number(evidence_type_id),
    });
    if (!okMap)
      return res.status(400).json({
        success: false,
        message: "invalid indicator/evidence_type pair",
      });

    // 3. บันทึกลงตาราง attachments โดยนำตัวแปรที่เราเตรียมไว้ไป insert
    const [id] = await db("attachments").insert({
      period_id: Number(period_id),
      evaluatee_id,
      indicator_id: Number(indicator_id),
      evidence_type_id: Number(evidence_type_id),
      attachment_type, // เพิ่มฟิลด์ประเภท
      file_name,
      mime_type,
      size_bytes,
      storage_path,
    });

    const created = await attRepo.findById(id);

    // 4. ส่งกลับ response (ถ้าเป็นลิงก์ ไม่ต้องใส่ prefix /uploads/)
    const responseUrl = created.attachment_type === "link"
      ? created.storage_path
      : `/uploads/${created.storage_path}`;

    res.status(201).json({
      success: true,
      data: { ...created, url: responseUrl },
    });
  } catch (e) {
    next(e);
  }
};

// =====================================================================
// Evaluatee: LIST ของตัวเอง
// Query optional: period_id, indicator_id, evidence_type_id
// =====================================================================
exports.listMine = async (req, res, next) => {
  try {
    const evaluatee_id = Number(req.user?.id);
    const { period_id, indicator_id, evidence_type_id } = req.query || {};

    let q = db("attachments").where({ evaluatee_id }).orderBy("id", "desc");
    if (period_id) q = q.andWhere({ period_id: Number(period_id) });
    if (indicator_id) q = q.andWhere({ indicator_id: Number(indicator_id) });
    if (evidence_type_id)
      q = q.andWhere({ evidence_type_id: Number(evidence_type_id) });

    const rows = await q;
    const data = rows.map((r) => ({ ...r, url: `/uploads/${r.storage_path}` }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

// =====================================================================
// Evaluatee: DELETE ของตัวเอง (ลบได้เฉพาะช่วงที่ period ยังเปิด)
// =====================================================================
exports.deleteMine = async (req, res, next) => {
  try {
    const evaluatee_id = Number(req.user?.id);
    const id = Number(req.params.id);
    const row = await attRepo.findById(id);

    if (!row || row.evaluatee_id !== evaluatee_id) {
      return res.status(404).json({ success: false, message: "not found" });
    }
    if (!(await isPeriodActive(row.period_id))) {
      return res.status(403).json({ success: false, message: "period closed" });
    }

    const abs = path.join(__dirname, "..", "uploads", row.storage_path);
    await db("attachments").where({ id }).del();
    safeUnlink(abs);

    res.json({ success: true, message: "deleted" });
  } catch (e) {
    next(e);
  }
};

// =====================================================================
// Evaluatee: UPDATE FILE ของตัวเอง  (ของเดิมของคุณ)
// =====================================================================
exports.updateFileMine = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const id = Number(req.params.id);
    if (!req.file)
      return res.status(400).json({ success: false, message: "no file" });

    const row = await attRepo.findById(id);
    if (!row || row.evaluatee_id !== userId)
      return res.status(404).json({ success: false, message: "not found" });

    if (!(await isPeriodActive(row.period_id))) {
      return res.status(403).json({ success: false, message: "period closed" });
    }

    const oldAbs = path.join(__dirname, "..", "uploads", row.storage_path);
    const newRel = relFromUploads(req.file.path);

    const originalName = Buffer.from(req.file.originalname, "latin1").toString(
      "utf8",
    );

    await db("attachments").where({ id }).update({
      file_name: originalName,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      storage_path: newRel,
    });

    safeUnlink(oldAbs);
    const updated = await attRepo.findById(id);
    res.json({
      success: true,
      data: { ...updated, url: `/uploads/${updated.storage_path}` },
    });
  } catch (e) {
    next(e);
  }
};

// =====================================================================
// Evaluatee: UPDATE META ของตัวเอง (ของเดิมของคุณ)
// =====================================================================
exports.updateMetaMine = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const id = Number(req.params.id);
    const { indicator_id, evidence_type_id } = req.body || {};

    const row = await attRepo.findById(id);
    if (!row || row.evaluatee_id !== userId)
      return res.status(404).json({ success: false, message: "not found" });

    if (!(await isPeriodActive(row.period_id))) {
      return res.status(403).json({ success: false, message: "period closed" });
    }

    const newIndicator = indicator_id ? Number(indicator_id) : row.indicator_id;
    const newEvType = evidence_type_id
      ? Number(evidence_type_id)
      : row.evidence_type_id;

    const okMap = await mapRepo.mapExists({
      indicator_id: newIndicator,
      evidence_type_id: newEvType,
    });
    if (!okMap)
      return res.status(400).json({
        success: false,
        message: "invalid indicator/evidence_type pair",
      });

    await db("attachments").where({ id }).update({
      indicator_id: newIndicator,
      evidence_type_id: newEvType,
    });

    const updated = await attRepo.findById(id);
    res.json({
      success: true,
      data: { ...updated, url: `/uploads/${updated.storage_path}` },
    });
  } catch (e) {
    next(e);
  }
};

// =====================================================================
// Evaluator: LIST หลักฐานของ evaluatee ที่ดูแล
// Query optional: period_id
// =====================================================================
exports.listForEvaluator = async (req, res, next) => {
  try {
    const evaluateeId = Number(req.params.evaluateeId);
    const { period_id } = req.query || {};

    let q = db("attachments")
      .where({ evaluatee_id: evaluateeId })
      .orderBy("id", "desc");
    if (period_id) q = q.andWhere({ period_id: Number(period_id) });

    // (ถ้าต้องการตรวจสิทธิ์ evaluator ↔ evaluatee เพิ่ม เติมที่นี่)
    const rows = await q;
    const data = rows.map((r) => ({ ...r, url: `/uploads/${r.storage_path}` }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
