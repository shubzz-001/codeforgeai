import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    const res = await api.get("/projects/");
    setProjects(res.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("description", description);

    try {
      await api.post("/projects/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Project uploaded!");
      fetchProjects();
    } catch {
      alert("Upload failed");
    }
  };

  return (
    <div>
      <Navbar />
      <h2>Your Projects</h2>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Project Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default Dashboard;