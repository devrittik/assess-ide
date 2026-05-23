const Project = require('../models/Project');
const { isConnected } = require('../config/db');

function requireDB(res) {
  if (!isConnected()) {
    res.status(503).json({ error: 'Database not connected' });
    return false;
  }
  return true;
}

exports.getProject = async (req, res) => {
  if (!requireDB(res)) return;
  try {
    const project = await Project.findOne({ projectId: req.params.id }).lean();
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('[getProject]', err);
    res.status(500).json({ error: 'Failed to load project' });
  }
};

exports.saveProject = async (req, res) => {
  if (!requireDB(res)) return;
  try {
    const { id } = req.params;
    const { files, name } = req.body;
    if (!files || typeof files !== 'object') {
      return res.status(400).json({ error: 'files must be an object' });
    }
    const update = { files };
    if (name) update.name = name;
    const project = await Project.findOneAndUpdate(
      { projectId: id },
      { $set: update, $setOnInsert: { projectId: id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ ok: true, project });
  } catch (err) {
    console.error('[saveProject]', err);
    res.status(500).json({ error: 'Failed to save project' });
  }
};

exports.deleteProject = async (req, res) => {
  if (!requireDB(res)) return;
  try {
    await Project.deleteOne({ projectId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteProject]', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
