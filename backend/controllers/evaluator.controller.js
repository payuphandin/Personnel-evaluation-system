const db = require("../db/knex");
const path = require("path");
// --------------------------------------------------
// 1. ดึงรายชื่อครูที่ evaluator ต้องประเมิน (จาก assignments)
// --------------------------------------------------
exports.myAssignments = async (req, res) => {
  try {
    const evaluator_id = req.user.id;
    
    const data = await db("assignments as a")
      .join("users as u", "u.id", "a.evaluatee_id")
      .join("departments as d", "d.id", "a.dept_id")
      .join("evaluation_periods as p", "p.id", "a.period_id")
      .where("a.evaluator_id", evaluator_id)
      .select(
        "a.id",
        "a.period_id",
        "a.evaluatee_id",
        "a.evaluator_role",
        "u.name_th as evaluatee_name",
        "u.position as evaluatee_position",
        "d.name_th as dept_name",
        "p.name_th as period_name",
        "a.evaluator_status",
        "a.evaluator_signature",
        "a.evaluator_signed_at"

      );

    res.json({ data });

  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message
    });
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
        message: "evaluatee_id and period_id are required"
      });
    }

    const data = await db("attachments as a")
      .join("indicators as i", "i.id", "a.indicator_id")
      .join("evidence_types as e", "e.id", "a.evidence_type_id")
      .where({
        "a.evaluatee_id": evaluatee_id,
        "a.period_id": period_id
      })
      .select(
        "a.id",
        "a.indicator_id",
        "a.file_name",
        "a.storage_path",
        "i.name_th as indicator_name",
        "e.name_th as evidence_name"
      );

    res.json({ data });

  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message
    });
  }
};

// --------------------------------------------------
// 3. ดึง indicators ทั้งหมดเพื่อใช้สร้างฟอร์มให้คะแนน
// --------------------------------------------------
exports.indicators = async (req, res) => {
  try {
    const data = await db("indicators")
      .where("active", 1)
      .select(
        "id",
        "topic_id",
        "name_th",
        "type"
      );

    res.json({ data });

  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message
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
        evaluator_id
      })
      .select(
        "indicator_id",
        "score",
        "value_yes_no",
        "notes",
        "status"
      );

    res.json({ data });

  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message
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

    // Loop บันทึกคะแนนรายข้อ
    for (const r of rows) {
      const currentStatus = r.status || "draft";

      const exists = await db("evaluation_results")
        .where({
          period_id: r.period_id,
          evaluatee_id: r.evaluatee_id,
          evaluator_id: evaluator_id,
          indicator_id: r.indicator_id
        })
        .first();

      if (exists) {
        await db("evaluation_results")
          .where({ id: exists.id })
          .update({
            score: r.score,
            value_yes_no: r.value_yes_no,
            notes: r.notes,
            status: currentStatus 
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
          status: currentStatus 
        });
      }
    }

    // ⭐ [เพิ่มใหม่] อัปเดตสถานะภาพรวมใน assignments เป็น 'evaluating' (กำลังประเมิน)
    if (rows.length > 0) {
      const { period_id, evaluatee_id } = rows[0];
      await db("assignments")
        .where({
          period_id: period_id,
          evaluatee_id: evaluatee_id,
          evaluator_id: evaluator_id
        })
        .update({
          evaluator_status: 'evaluating' // เปลี่ยนสถานะเป็นกำลังประเมิน
        });
    }

    res.json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });

  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message
    });
  }
};


// --------------------------------------------------
// ⭐ [เพิ่มใหม่] 6. ฟังก์ชันสำหรับลงนามปิดจบการประเมิน
// --------------------------------------------------
exports.submitEvaluation = async (req, res) => {
  try {
    const evaluator_id = req.user.id;
    const { evaluatee_id, period_id, signature } = req.body;

    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!evaluatee_id || !period_id || !signature) {
      return res.status(400).json({ 
        status: "Error", 
        message: "ข้อมูลไม่ครบถ้วน (ต้องมี evaluatee_id, period_id และ signature)" 
      });
    }

    // 2. ตรวจสอบว่าประเมินครบ 16 ข้อหรือยัง
    const results = await db("evaluation_results")
      .where({
        evaluator_id: evaluator_id,
        evaluatee_id: evaluatee_id,
        period_id: period_id
      });

    if (results.length < 16) {
      return res.status(400).json({ 
        status: "Error", 
        message: "กรุณาประเมินให้ครบทั้ง 16 ข้อก่อนทำการลงนาม" 
      });
    }

    // 3. ตรวจสอบสถานะรายข้อว่าไม่มีข้อไหนค้างเป็น 'draft'
    const hasDrafts = results.some(r => r.status === 'draft');
    if (hasDrafts) {
       return res.status(400).json({ 
        status: "Error", 
        message: "มีบางหัวข้อยังเป็นสถานะ 'ร่าง' กรุณายืนยันคะแนนให้ครบก่อนลงนาม" 
      });
    }

    // 4. บันทึกลายเซ็นและอัปเดตสถานะเป็น 'completed' ในตาราง assignments
    await db("assignments")
      .where({
        evaluator_id: evaluator_id,
        evaluatee_id: evaluatee_id,
        period_id: period_id
      })
      .update({
        evaluator_status: 'completed',
        evaluator_signature: signature,
        evaluator_signed_at: db.fn.now() // บันทึกวันเวลาปัจจุบันจากฝั่ง Database
      });

    res.json({ 
      success: true, 
      message: "ลงนามและส่งผลการประเมินเรียบร้อยแล้ว" 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Error",
      message: error.message
    });
  }
};


exports.deleteResult = async (req, res) => {
  try {
    const evaluator_id = req.user.id;
    const indicator_id = Number(req.params.indicatorId);
    const { evaluatee_id, period_id } = req.query;

    await db('evaluation_results')
      .where({
        evaluator_id,
        evaluatee_id,
        period_id,
        indicator_id
      })
      .del();

    res.json({
      success: true,
      message: 'ลบผลการประเมินแล้ว'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
};

exports.deleteAllResults = async (req, res) => {
  try {
    const evaluator_id = req.user.id;
    const { evaluatee_id, period_id } = req.query;

    await db('evaluation_results')
      .where({
        evaluator_id,
        evaluatee_id,
        period_id
      })
      .del();

    res.json({
      success: true,
      message: 'ล้างผลการประเมินทั้งหมดแล้ว'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
};


exports.downloadFile = async (req, res) => {
  const file = await db("attachments")
    .where("id", req.params.id)
    .first();

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found"
    });
  }

  const fullPath = path.join(
    __dirname,
    "..",
    "uploads",
    file.storage_path
  );

  console.log(fullPath);

  res.download(fullPath, file.file_name);
};