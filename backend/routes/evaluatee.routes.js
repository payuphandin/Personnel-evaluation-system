const express = require("express");
const router = express.Router();
const db = require("../db/knex");
// routes/users.routes.js
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/evaluatee.controller');


router.get('/evaluation_result' , auth('evaluatee') , ctrl.evaluation_result);

router.get('/evidence-list', auth('evaluatee'), ctrl.evidenceList);

router.get('/periods-list', auth('evaluatee'), ctrl.listPeriods);

router.get('/self-evaluation-form', auth('evaluatee'), ctrl.getSelfEvaluationForm);

router.post('/self-evaluation-save', auth('evaluatee'), ctrl.saveSelfEvaluation);

module.exports = router;