import { useState } from "react";
import api from "../api/axios";

function FileCard({ file }) {
  const [code, setCode] = useState("");

  const loadCode = async () => {
    const res = await api.get(`/projects/files/${file.id}`);
    setCode(res.data.content);
  };

  return (
    <div style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
      <h4 onClick={loadCode} style={{ cursor: "pointer" }}>
        {file.fileName}
      </h4>

      <p>Lines: {file.lineCount}</p>
      <p>Methods: {file.methodCount}</p>
      <p>Complexity: {file.complexityScore}</p>

      <p><strong>AI Summary:</strong> {file.aiSummary}</p>
      <p><strong>Suggestion:</strong> {file.aiSuggestion}</p>

      {code && (
        <pre style={{ background: "#eee", padding: "10px" }}>
          {code}
        </pre>
      )}
    </div>
  );
}

export default FileCard;