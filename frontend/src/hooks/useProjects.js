import { useState, useEffect, useCallback } from 'react';
import { projectsApi, filesApi } from '../api/projects';

/**
 * useProjects — fetches the project list + stats, exposes refresh + CRUD helpers.
 */
export function useProjects() {
  const [projects, setProjects]   = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, statsData] = await Promise.all([
        projectsApi.getAll(),
        projectsApi.getStats(),
      ]);
      setProjects(data || []);
      setStats(statsData || {});
    } catch (err) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createProject = async (formData) => {
    const created = await projectsApi.create(formData);
    await fetchAll();
    return created;
  };

  const deleteProject = async (id) => {
    await projectsApi.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const analyzeProject = async (id) => {
    await projectsApi.analyze(id);
    await fetchAll();
  };

  return {
    projects,
    stats,
    loading,
    error,
    refresh: fetchAll,
    createProject,
    deleteProject,
    analyzeProject,
  };
}

/**
 * useProject — fetches a single project + its files, exposes per-file analysis.
 */
export function useProject(id) {
  const [project, setProject]     = useState(null);
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingFileId, setAnalyzingFileId] = useState(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [proj, fileList] = await Promise.all([
        projectsApi.getById(id),
        filesApi.getByProject(id),
      ]);
      setProject(proj);
      setFiles(fileList);
    } catch (err) {
      setError(err?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const analyzeAll = async () => {
    setAnalyzing(true);
    try {
      await projectsApi.analyze(id);
      await fetchProject();
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeFile = async (fileId) => {
    setAnalyzingFileId(fileId);
    try {
      await filesApi.analyze(id, fileId);
      await fetchProject();
    } finally {
      setAnalyzingFileId(null);
    }
  };

  return {
    project,
    files,
    loading,
    error,
    analyzing,
    analyzingFileId,
    refresh:     fetchProject,
    analyzeAll,
    analyzeFile,
  };
}