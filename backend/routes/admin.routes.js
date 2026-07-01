const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.controller");
const auth = require("../middlewares/auth");

// ---------------------------------------------------------
// 1. PERIODS (รอบการประเมิน)
// ---------------------------------------------------------
router.get("/list_periods",             auth("admin"), ctrl.list);
router.post("/create_periods",          auth("admin"), ctrl.create);
router.put("/update_periods/:id",       auth("admin"), ctrl.update);
router.delete("/delete_periods/:id",    auth("admin"), ctrl.remove);

// ---------------------------------------------------------
// 2. CATEGORIES & TOPICS (หมวดหมู่และหัวข้อ)
// ---------------------------------------------------------
router.get("/list_category",            auth("admin"), ctrl.list_categories);
router.post("/create_cat",              auth("admin"), ctrl.create_cat);
router.put("/update_cat/:id",           auth("admin"), ctrl.update_cat);
router.delete("/delete_cat/:id",        auth("admin"), ctrl.remove_cat);

router.get("/list_topics",              auth("admin"), ctrl.list_topics);
router.post("/create_topics",           auth("admin"), ctrl.create_topics);
router.put("/update_topics/:id",        auth("admin"), ctrl.update_topics);
router.delete("/delete_topic/:id",        auth("admin"), ctrl.delete_topic);

// ---------------------------------------------------------
// 3. ASSIGNMENTS & USERS (การมอบหมายและรายชื่อคน)
// ---------------------------------------------------------
router.get("/list_departments",         auth("admin"), ctrl.list_departments);
router.get("/list_evaluatee",           auth("admin"), ctrl.list_evaluatee);
router.get("/list_evaluator",           auth("admin"), ctrl.list_evaluator);

router.get("/list_assignments",         auth("admin"), ctrl.list_assignments);
router.post("/create_assignments",      auth("admin"), ctrl.create_assignments);
router.put("/update_assignments/:id",   auth("admin"), ctrl.update_assignments);
router.delete("/delete_assignments/:id", auth("admin"), ctrl.remove_assignments);
router.delete("/delete_user/:id", auth("admin"), ctrl.remove_user);
router.get("/list_attachments",               auth("evaluator", "admin"), ctrl.list_attachments);

// ---------------------------------------------------------
// 4. EVALUATION PROCESS (สำหรับ Evaluator & Admin)
// ---------------------------------------------------------
router.get("/admin_list_assignments",   auth("evaluator", "admin"), ctrl.myassignments);
router.get("/attachments",              auth("evaluator", "admin"), ctrl.attachments);
router.get("/results",                  auth("evaluator", "admin"), ctrl.results);
router.post("/save",                    auth("evaluator", "admin"), ctrl.save);

// ---------------------------------------------------------
// 5. CATEGORIES (หมวดหมู่)
// ---------------------------------------------------------
router.get("/list_categories",          auth("admin"), ctrl.list_categories);
router.post("/create_category",         auth("admin"), ctrl.create_cat);
router.put("/update_category/:id",      auth("admin"), ctrl.update_cat);
router.delete("/delete_category/:id",   auth("admin"), ctrl.remove_cat);

// ---------------------------------------------------------
// 5. INDICATORS (ตัวชี้วัด)
// ---------------------------------------------------------
router.get("/indicators",               auth("evaluator", "admin"), ctrl.indicators);
router.post("/create_indicator",        auth("evaluator", "admin"), ctrl.create_indicator);
router.put("/update_indicator/:id",     auth("evaluator", "admin"), ctrl.update_indicator);
router.delete("/delete_indicator/:id",  auth("evaluator", "admin"), ctrl.delete_indicator);




router.get("/list_org_groups",          auth("admin"), ctrl.list_org_groups);
router.put("/update_user/:id",               auth("admin"), ctrl.update_user);


router.get("/export_report", auth("admin"), ctrl.export_overview_report);
router.get("/average_score", auth("admin"), ctrl.average_score);
router.get("/evaluator_tracking", auth("admin"), ctrl.evaluator_tracking);
router.get("/evaluatee_tracking", auth("admin"), ctrl.evaluatee_tracking);
router.get("/summary_by_evaluator", auth("admin"), ctrl.summary_by_evaluator);
router.get("/individual_report", auth("admin"), ctrl.individual_report);

module.exports = router;
