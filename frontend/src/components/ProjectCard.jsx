import { useNavigate } from "react-router-dom";

function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        margin: "10px",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <h3>{project.name}</h3>
      <p>Total Lines: {project.totalLines}</p>
      <p>Complexity: {project.totalComplexity}</p>
      <p>Quality Score: {project.qualityScore}</p>
    </div>
  );
}

export default ProjectCard;