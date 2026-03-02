"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useFileSystem } from "@/lib/contexts/file-system-context";
import { Code2, Copy, Check } from "lucide-react";

export function CodeEditor() {
  const { selectedFile, getFileContent, updateFile } = useFileSystem();
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (selectedFile && value !== undefined) {
      updateFile(selectedFile, value);
    }
  };

  const handleCopy = async () => {
    if (!selectedFile) return;
    const content = getFileContent(selectedFile) || "";
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      case "css":
        return "css";
      case "html":
        return "html";
      case "md":
        return "markdown";
      default:
        return "plaintext";
    }
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <Code2 className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Select a file to edit</p>
          <p className="text-xs text-neutral-600 mt-1">Choose a file from the file tree</p>
        </div>
      </div>
    );
  }

  const content = getFileContent(selectedFile) || "";
  const language = getLanguageFromPath(selectedFile);

  // Build breadcrumb segments from path
  const segments = selectedFile.replace(/^\//, "").split("/");

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* File-path toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-neutral-700 bg-neutral-800 shrink-0">
        <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono min-w-0">
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <span className="text-neutral-600">/</span>}
              <span className={i === segments.length - 1 ? "text-neutral-200 truncate" : "text-neutral-500 truncate"}>
                {seg}
              </span>
            </span>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 transition-colors shrink-0"
          title="Copy file content"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
}
