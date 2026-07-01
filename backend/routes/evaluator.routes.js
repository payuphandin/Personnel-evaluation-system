const router = require("express").Router();
const controller = require("../controllers/evaluator.controller");
const auth = require("../middlewares/auth");

router.get("/my-assignments",auth("evaluator",),controller.myAssignments
);

router.get("/attachments",auth("evaluator"),controller.attachments
);
// import controller ...
// router.post("/save", evaluatorController.save); // ของเดิมที่คุณมีอยู่แล้ว

// ⭐ เพิ่ม Route ใหม่สำหรับการส่งลายเซ็น
router.post("/submit", auth("evaluator"), controller.submitEvaluation);
router.get("/indicators",auth("evaluator"),controller.indicators
);

router.get("/results", auth("evaluator"), controller.results
);

router.post("/save",auth("evaluator"),controller.save
);

router.delete('/result/:indicatorId',auth("evaluator"), controller.deleteResult);
router.delete('/results/all', auth("evaluator"), controller.deleteAllResults);

router.get('/download/:id', controller.downloadFile)

module.exports = router;
