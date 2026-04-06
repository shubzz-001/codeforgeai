import axios from './axios';

// All paths match your Spring Boot ProjectController exactly:
//   POST   /projects/upload          — uploadProject(file, name, description)
//   GET    /projects/                — getUserProjects()
//   GET    /projects/{id}/files      — getFiles(projectId)
//   GET    /projects/files/{fileId}  — getFileContent(fileId)

export const projectsApi = {
  getAll:          ()         => axios.get('/projects/').then(r => r.data),
  getFiles:        (id)       => axios.get(`/projects/${id}/files`).then(r => r.data),
  getFileContent:  (fileId)   => axios.get(`/projects/files/${fileId}`).then(r => r.data),
  create:          (formData) => axios.post('/projects/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
};