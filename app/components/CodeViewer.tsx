// components/CodeViewer.tsx
export default function CodeViewer({ file, code }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: "bold" }}>{file}</div>
      <pre style={{ background: "#222", color: "#fff", padding: 8 }}>{code}</pre>
    </div>
  );
}
