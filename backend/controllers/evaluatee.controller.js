const db = require("../db/knex");

// GET /api/evaluatee/evaluation-result
exports.evaluation_result = async (req, res) => {
  try {
    const evaluatee_id = req.user.id;
    const { period_id } = req.query;

    if (!period_id) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุรอบการประเมิน (period_id)" });
    }

    const results = await db("evaluation_results as er")
      .select(
        "i.code",
        "i.name_th as indicator_name",
        "i.type as indicator_type",
        db.raw("AVG(er.score) as avg_score"),
        db.raw("AVG(CASE WHEN er.value_yes_no = 1 THEN 1 ELSE 0 END) as avg_yes_no"),
        db.raw("GROUP_CONCAT(CASE WHEN er.notes IS NOT NULL AND er.notes != '' THEN CONCAT(u2.name_th, ': ', er.notes) ELSE NULL END SEPARATOR '; ') as merged_notes"),
        db.raw("MAX(er.status) as max_status")
      )
      .join("indicators as i", "er.indicator_id", "i.id")
      .join("users as u2", "er.evaluator_id", "u2.id")
      .where("er.evaluatee_id", evaluatee_id)
      .andWhere("er.period_id", period_id)
      .andWhere("er.status", "submitted") // เฉพาะผลประเมินที่ส่งยืนยันแล้ว
      .groupBy("i.id", "i.code", "i.name_th", "i.type")
      .orderBy("i.code", "asc");

    // ✨ ปรับตรงนี้: จัด Format ให้ตรงกับที่ Frontend .evaluation_result เรียกใช้
    const formattedData = results.map((item) => ({
      code: item.code,
      name_th: item.indicator_name, // ใส่ชื่อลงใน name_th เพื่อให้ตารางแสดงผล
      type: item.indicator_type,   // ส่งประเภทตัวชี้วัด (score_1_4 หรือ yes_no)
      evaluation_result: {
        score: item.avg_score !== null ? parseFloat(parseFloat(item.avg_score).toFixed(2)) : null,
        value_yes_no: item.avg_yes_no !== null ? (parseFloat(item.avg_yes_no) >= 0.5) : null,
        notes: item.merged_notes || "",
        status: item.max_status,
      },
    }));

    res.json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// http://localhost:7000/api/evaluatee/evidence-list
exports.evidenceList = async (req, res) => {
  try {
    const evaluatee_id = req.user.id;
    // รับ period_id จาก query ถ้าไม่มีให้ใช้ตัวที่ active
    const period_id = req.query.period_id;

    const now = new Date();
    try {
      await db("evaluation_periods")
        .where("is_active", 1)
        .andWhere("end_date", "<", now)
        .update({ is_active: 0 });
    } catch {}

    let period;
    if (period_id) {
      period = await db("evaluation_periods").where("id", period_id).first();
    } else {
      period = await db("evaluation_periods").where("is_active", 1).first();
    }

    if (!period) {
      return res.status(400).json({ message: "No active period found" });
    }

    // Subquery เพื่อรวมผลคะแนนเฉลี่ยรายข้อที่ส่งผลแล้ว (status = 'submitted')
    const avgResultsSubquery = db("evaluation_results as er")
      .select(
        "er.indicator_id",
        db.raw("AVG(er.score) as score"),
        db.raw("AVG(CASE WHEN er.value_yes_no = 1 THEN 1 ELSE 0 END) as value_yes_no"),
        db.raw("GROUP_CONCAT(CASE WHEN er.notes IS NOT NULL AND er.notes != '' THEN er.notes ELSE NULL END SEPARATOR '; ') as notes"),
        db.raw("MAX(er.status) as status")
      )
      .where({
        "er.evaluatee_id": evaluatee_id,
        "er.period_id": period.id,
        "er.status": "submitted"
      })
      .groupBy("er.indicator_id")
      .as("er");

    const list = await db("evidence_types as e")
      .select(
        "e.id as evidence_type_id",
        "e.code",
        "e.name_th",
        "ie.indicator_id",
        "a.id as attachment_id",
        "a.file_name",
        "a.storage_path",      // 👉 ดึงพาธ/ลิงก์หลักฐานแนบ
        "a.attachment_type",   // 👉 ดึงประเภทของหลักฐาน ('file' หรือ 'link')
        db.raw(
          "CASE WHEN a.id IS NOT NULL THEN true ELSE false END as uploaded",
        ),

        // 👉 ดึงข้อมูลการประเมิน
        "er.score",
        "er.value_yes_no",
        "er.notes",
        "er.status as evaluation_status",
      )
      .join("indicator_evidence as ie", "ie.evidence_type_id", "e.id")
      // Join ไฟล์แนบ
      .leftJoin("attachments as a", function () {
        this.on("a.evidence_type_id", "=", "e.id")
          .andOn("a.indicator_id", "=", "ie.indicator_id")
          .andOn("a.evaluatee_id", "=", db.raw("?", [evaluatee_id]))
          .andOn("a.period_id", "=", db.raw("?", [period.id]));
      })
      // 👉 Left Join ผลประเมินเฉลี่ย
      .leftJoin(avgResultsSubquery, "er.indicator_id", "ie.indicator_id");

    // ตกแต่งข้อมูลก่อนส่งกลับ (Transform)
    const formattedList = list.map((row) => ({
      evidence_type_id: row.evidence_type_id,
      code: row.code,
      name_th: row.name_th,
      indicator_id: row.indicator_id,
      attachment_id: row.attachment_id,
      uploaded: !!row.uploaded,
      file_name: row.file_name,
      storage_path: row.storage_path,      // 👉 ส่งค่าพาธ/ลิงก์ กลับไปด้วย
      attachment_type: row.attachment_type, // 👉 ส่งประเภทของหลักฐาน กลับไปด้วย
      // ยุบรวมข้อมูลประเมินเข้า object เดียวเพื่อให้ Frontend ใช้ง่าย
      evaluation_result: row.evaluation_status
        ? {
            score: row.score !== null ? parseFloat(parseFloat(row.score).toFixed(2)) : null,
            value_yes_no: row.value_yes_no !== null ? (parseFloat(row.value_yes_no) >= 0.5) : null,
            notes: row.notes,
            status: row.evaluation_status,
          }
        : null,
    }));

    res.json(formattedList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listPeriods = async (req, res) => {
  try {
    const now = new Date();
    await db("evaluation_periods")
      .where("is_active", 1)
      .andWhere("end_date", "<", now)
      .update({ is_active: 0 });
  } catch {}

  const rows = await db("evaluation_periods")
    .select("id", "name_th", "is_active", "start_date", "end_date")
    .orderBy("id", "desc");

  res.json(rows);
};

// ==========================================
// 1. GET: ดึงข้อมูลการประเมินตนเองของรอบนั้นๆ
// ==========================================
// controllers/selfEvaluationController.js

exports.getSelfEvaluationForm = async (req, res) => {
  try {
    const evaluatee_id = req.user.id; // ดึง ID ของครูที่ Logged in อยู่จาก Middleware
    const period_id = req.query.period_id || req.body.period_id; // รับรอบการประเมินส่งมาจากหน้าเว็บ

    if (!period_id) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุรอบการประเมิน (period_id)" });
    }

    // 1. ดึงรายการตัวชี้วัดทั้งหมด 17 ข้อ พร้อมหัวข้อหลัก
    const indicators = await db("indicators as i")
      .join("evaluation_topics as t", "t.id", "i.topic_id")
      .select(
        "t.id as topic_id",
        "t.title_th as topic_title",
        "i.id as indicator_id",
        "i.code as indicator_code",
        "i.name_th as indicator_name",
        "i.description as indicator_desc",
        "i.type as indicator_type",
        "i.min_score",
        "i.max_score",
      )
      .where("i.active", 1)
      .orderBy(["t.id", "i.id"]);

    // 2. ดึงข้อมูลการประเมินตนเองที่เคยบันทึกไว้ในตาราง self_evaluation_results
    const savedResults = await db("self_evaluation_results").where({
      period_id: period_id,
      evaluatee_id: evaluatee_id,
    });

    const periodExists = await db("evaluation_periods")
      .where("id", period_id)
      .first();
    if (!periodExists) {
      return res
        .status(404)
        .json({ message: "ไม่พบรอบการประเมินนี้ในระบบ (ID ไม่ถูกต้อง)" });
    }

    // 3. นำข้อมูลมารวมกันเพื่อส่งไปให้ Frontend แสดงผลได้ง่ายๆ
    const formFields = indicators.map((ind) => {
      // หาข้อที่ตรงกันในตารางประเมินตนเอง
      const savedRow = savedResults.find(
        (r) => r.indicator_id === ind.indicator_id,
      );

      return {
        ...ind,
        self_result_id: savedRow ? savedRow.id : null,
        score: savedRow ? savedRow.score : null,
        value_yes_no: savedRow ? savedRow.value_yes_no : null,
        notes: savedRow ? savedRow.notes : "",
        status: savedRow ? savedRow.status : "not_started",
      };
    });

    // ✨ ดึงข้อมูลภาพรวมการส่งจากตาราง self_eval_submissions
    const submission = await db("self_eval_submissions")
      .where({ period_id, evaluatee_id })
      .first();

    // ส่งกลับเป็น Object ที่มีทั้งรายละเอียดและภาพรวม
    res.json({
      submission: submission || { status: 'draft', signature: null, signed_at: null },
      indicators: formFields
    });
  } catch (error) {
    console.error("Get Self-Eval Error:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลแบบประเมินตนเอง" });
  }
};

// ==========================================
// 2. POST: บันทึกข้อมูลการประเมินตนเอง
// ==========================================
exports.saveSelfEvaluation = async (req, res) => {
  try {
    const evaluatee_id = req.user.id;
    const { period_id, status, answers, signature } = req.body; // status จะรับค่า 'draft' หรือ 'submitted' มาจาก UI

    if (!period_id || !answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ success: false, message: "ข้อมูลที่ส่งมาไม่ครบถ้วน" });
    }

    // ปรับปรุง Query: ให้มั่นใจว่าสถานะ (status) จะถูกเปลี่ยนตามค่าที่ส่งมา
    const query = `
      INSERT INTO self_evaluation_results 
        (period_id, evaluatee_id, topic_id, indicator_id, score, value_yes_no, notes, status)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        score = VALUES(score), 
        value_yes_no = VALUES(value_yes_no), 
        notes = VALUES(notes),
        status = VALUES(status) 
    `;

    // แปลง Array ของ Object ให้กลายเป็น Array 2 มิติ
    const values = answers.map((ans) => [
      period_id,
      evaluatee_id,
      ans.topic_id,
      ans.indicator_id,
      ans.score ?? null, // ใช้ nullish coalescing operator สั้นกว่า
      ans.value_yes_no ?? null,
      ans.notes || "",
      status || "draft", // อัปเดตสถานะให้เป็นค่าล่าสุดที่ส่งมา
    ]);

    if (values.length > 0) {
      await db.raw(query, [values]);
      
      // ✨ อัปเดตตารางภาพรวมการประเมินตนเอง (self_eval_submissions)
      const submissionData = {
        period_id,
        evaluatee_id,
        status: status || 'draft',
        signature: signature || null
      };

      await db.raw(`
        INSERT INTO self_eval_submissions (period_id, evaluatee_id, status, signature, signed_at)
        VALUES (:period_id, :evaluatee_id, :status, :signature, CASE WHEN :status = 'submitted' THEN NOW() ELSE NULL END)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          signature = IFNULL(VALUES(signature), signature),
          signed_at = CASE WHEN VALUES(status) = 'submitted' THEN NOW() ELSE NULL END
      `, submissionData);
    }

    res.json({
      success: true,
      message:
        status === "submitted"
          ? "ยืนยันผลการประเมินเรียบร้อยแล้ว"
          : "บันทึกฉบับร่างเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error saving self-assessment:", error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
};
