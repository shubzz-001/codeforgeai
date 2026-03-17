import { useState } from "react";
import api from "../api/axios";
import Editor from "@monaco-editor/react";

function FileCard({ file }) {
  const [code, setCode] = useState("");

  const loadCode = async () => {
    const res = await api.get(`/projects/files/${file.id}`);
    setCode(res.data.content);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4 shadow">

    <h4
      onClick={loadCode}
      className="text-blue-400 cursor-pointer font-semibold"
    >
      {file.fileName}
    </h4>

    <div className="text-sm text-gray-400 mt-2">
      <p>Lines: {file.lineCount}</p>
      <p>Methods: {file.methodCount}</p>
      <p>Complexity: {file.complexityScore}</p>
    </div>

    <div className="mt-3">
      <p className="text-green-300">
        <b>AI Summary:</b> {file.aiSummary}
      </p>

      <p className="text-yellow-300">
        <b>Suggestion:</b> {file.aiSuggestion}
      </p>
    </div>

    {code && (
      <div className="mt-4 border border-gray-700 rounded">
        <Editor
          height="400px"
          defaultLanguage="java"
          theme="vs-dark"
          value={code}
          options={{ readOnly: true }}
        />
      </div>
    )}

  </div>
  );
}

export default FileCard;