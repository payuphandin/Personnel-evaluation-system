const router = require("express").Router();
// routes/users.routes.js
const ctrl = require("../controllers/users.controller");

const auth = require("../middlewares/auth");

router.get("/list_departments", ctrl.list_departments);

router.get("/list_org_groups", ctrl.list_org_groups);

router.get("/server", auth("admin", "evaluator", "evaluatee"), ctrl.listServer);

router.get("/", auth("admin", "evaluator", "evaluatee"), ctrl.list);

//http://localhost:7000/api/users
router.get("/list_all", auth("admin", "evaluator", "evaluatee"), ctrl.list_all);

router.get("/:id", auth("admin", "evaluator", "evaluatee"), ctrl.get);

router.post("/create_user", ctrl.create);
// router.post('/',  ctrl.create);


router.delete("/delete/:id", auth("admin"), ctrl.remove);

module.exports = router;
