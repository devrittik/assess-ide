const express = require('express');
const router = express.Router();
const { getProject, saveProject, deleteProject } = require('../controllers/projectController');

router.get('/:id', getProject);
router.post('/:id', saveProject);
router.delete('/:id', deleteProject);

module.exports = router;
