import axios from './axios';

// Matches ProjectController.java exactly:
//   POST   /projects/upload          → uploadProject(file, name, description)
//   GET    /projects/                → getUserProjects()
//   GET    /projects/{id}/files      → getFiles(projectId)
//   GET    /projects/files/{fileId}  → getFileContent(fileId)

export const projectsApi = {
  /** GET /projects/ */
  getAll: () =>
    axios.get('/projects/').then(r => r.data),

  /** GET /projects/:id/files (project summary comes from files list) */
  getById: (id) =>
    axios.get(`/projects/${id}/files`).then(r => ({ id, files: r.data })),

  /** POST /projects/upload — multipart: file (single), name, description */
  create: (formData) =>
    axios.post('/projects/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** GET /projects/:id/files */
  getFiles: (projectId) =>
    axios.get(`/projects/${projectId}/files`).then(r => r.data),

  /** GET /projects/files/:fileId */
  getFileContent: (fileId) =>
    axios.get(`/projects/files/${fileId}`).then(r => r.data),
};