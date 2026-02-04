const express = require('express');
const router = express.Router();

router.get('/module/:moduleId', (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  const projects = req.mockDB.projects.filter(p => p.module_id === moduleId);
  res.json(projects);
});

router.get('/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = req.mockDB.projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const module = req.mockDB.modules.find(m => m.id === project.module_id);
  res.json({
    ...project,
    module_title: module?.title,
    course_id: module?.course_id
  });
});

module.exports = router;
