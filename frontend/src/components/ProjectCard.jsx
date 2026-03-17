// import { useNavigate } from "react-router-dom";

function ProjectCard({ project }) {
  // const navigate = useNavigate();

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow hover:scale-105 transition cursor-pointer">

      <h3 className="text-xl font-semibold mb-2">
        {project.name}
      </h3>

      <p className="text-gray-400">Lines: {project.totalLines}</p>
      <p className="text-gray-400">Complexity: {project.totalComplexity}</p>

      <p className="mt-2 text-green-400 font-bold">
        Score: {project.qualityScore}
      </p>

    </div>
  );
}

export default ProjectCard;