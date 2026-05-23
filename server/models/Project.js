const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: 'Untitled Project' },
    files: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('Project', ProjectSchema);
