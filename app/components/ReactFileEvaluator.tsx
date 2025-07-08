"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import styles from "./ReactFileEvaluator.module.css";

export default function ReactFileEvaluator() {
  const [selectedContent, setSelectedContent] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const evaluateReactFile = useMutation("evaluateReactFile");

  const handleSubmit = async () => {
    if (!selectedContent) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await evaluateReactFile({ code: selectedContent });
      setResult(res?.message ?? "No response from evaluation.");
    } catch (error) {
      setResult("Error during evaluation: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>React File Evaluator</h1>
      <textarea
        className={styles.textarea}
        placeholder="Select a file from the tree..."
        value={selectedContent}
        onChange={(e) => setSelectedContent(e.target.value)}
        rows={15}
        readOnly={false}
      />
      <button
        className={styles.button}
        onClick={handleSubmit}
        disabled={loading || !selectedContent.trim()}
      >
        {loading ? "Evaluating..." : "Evaluate React File"}
      </button>
      {result && <div className={styles.result}>{result}</div>}
    </div>
  );
}