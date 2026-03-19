import axios from './axios';

// Matches ProjectController.java:
//   POST   /projects/upload          — uploadProject(file, name, description)
//   GET    /projects/                — getUserProjects()
//   GET    /projects/{id}/files      — getFiles(projectId)
//   GET    /projects/files/{fileId}  — getFileContent(fileId)

export const projectsApi = {

  // GET /projects/ — returns list of Project objects
  getAll: () =>
    axios.get('/projects/').then(r => r.data),

  // GET /projects/{id}/files — returns List<CodeFile>
  // CodeFile fields: id, fileName, filePath, content, lineCount,
  //                  methodCount, classCount, complexityScore,
  //                  aiSummary, aiSuggestion
  getFiles: (projectId) =>
    axios.get(`/projects/${projectId}/files`).then(r => r.data),

  // GET /projects/files/{fileId} — returns single CodeFile with content
  getFileContent: (fileId) =>
    axios.get(`/projects/files/${fileId}`).then(r => r.data),

  // POST /projects/upload — multipart: file (ZIP), name, description
  create: (formData) =>
    axios.post('/projects/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};