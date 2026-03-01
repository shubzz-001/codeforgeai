function FileCard({ file }) {
  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <h4>{file.fileName}</h4>
      <p>Lines: {file.lineCount}</p>
      <p>Methods: {file.methodCount}</p>
      <p>Complexity: {file.complexityScore}</p>
      <p><strong>AI Summary:</strong> {file.aiSummary}</p>
      <p><strong>Suggestion:</strong> {file.aiSuggestion}</p>
    </div>
  );
}

export default FileCard;