"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileSystem } from "@/lib/contexts/file-system-context";
import JSZip from "jszip";

interface DownloadButtonProps {
  projectName?: string;
}

export function DownloadButton({ projectName = "uigen-component" }: DownloadButtonProps) {
  const { getAllFiles } = useFileSystem();
  const [isDownloading, setIsDownloading] = useState(false);

  const files = getAllFiles();
  if (files.size === 0) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      files.forEach((content, path) => {
        // Strip leading slash for zip paths
        zip.file(path.replace(/^\//, ""), content);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleDownload}
      disabled={isDownloading}
      title="Download ZIP"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}
