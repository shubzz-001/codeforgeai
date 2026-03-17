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
    <div className="bg-gray-900 min-h-screen text-white">
  <Navbar />

  <div className="p-6 max-w-6xl mx-auto">

    <h2 className="text-3xl font-bold mb-6">
      🚀 Your Projects
    </h2>

    {/* Upload Form */}
    <form
      onSubmit={handleUpload}
      className="bg-gray-800 p-6 rounded-lg mb-8 shadow-md space-y-4"
    >
      <h3 className="text-xl font-semibold">Upload New Project</h3>

      <input
        className="w-full p-2 rounded bg-gray-700"
        placeholder="Project Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full p-2 rounded bg-gray-700"
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full p-2 bg-gray-700 rounded"
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500">
        Upload Project
      </button>
    </form>

    {/* Project Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>

  </div>
</div>
  );
}

export default Dashboard;