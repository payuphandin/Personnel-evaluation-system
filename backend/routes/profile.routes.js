const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profile.controller");
const auth = require("../middlewares/auth");

// เมื่อยิงมาที่ /api/profile + / จะวิ่งเข้าหาฟังก์ชัน Profile
router.get("/getprofile", auth(), ctrl.Profile);
router.put("/changepassword", auth(), ctrl.changePassword)
;
router.put("/updateprofile", auth(), ctrl.updateProfile);
router.get("/options", auth(), ctrl.getOptions);

module.exports = router;