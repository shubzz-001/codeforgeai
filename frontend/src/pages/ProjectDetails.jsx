import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import FileCard from "../components/FileCard";

function ProjectDetails() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await api.get(`/projects/${id}/files`);
      setFiles(res.data);
    };
    fetchFiles();
  }, [id]);

  return (
    <div>
      <Navbar />
      <h2>Project Files</h2>
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}

export default ProjectDetails;