"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileSystemProvider } from "@/lib/contexts/file-system-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { FileTree } from "@/components/editor/FileTree";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderActions } from "@/components/HeaderActions";
import { DownloadButton } from "@/components/DownloadButton";

interface MainContentProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function MainContent({ user, project }: MainContentProps) {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");

  return (
    <FileSystemProvider initialData={project?.data}>
      <ChatProvider projectId={project?.id} initialMessages={project?.messages}>
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-50">
          {/* Unified Top Navigation Bar */}
          <header className="h-14 border-b border-neutral-200 bg-white flex items-center px-4 gap-4 shrink-0 z-10">
            {/* Left: Logo */}
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-neutral-900 tracking-tight text-sm">UIGen</span>
            </div>

            {/* Center: Tabs */}
            <div className="flex-1 flex justify-center">
              <Tabs
                value={activeView}
                onValueChange={(v) => setActiveView(v as "preview" | "code")}
              >
                <TabsList className="bg-neutral-100 border border-neutral-200 p-0.5 h-8 shadow-sm">
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 px-4 py-1 text-sm font-medium transition-all h-7"
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 px-4 py-1 text-sm font-medium transition-all h-7"
                  >
                    Code
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <DownloadButton projectName={project?.name} />
              <HeaderActions user={user} projectId={project?.id} />
            </div>
          </header>

          {/* Content Area */}
          <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
            {/* Left Panel - Chat */}
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <div className="h-full flex flex-col bg-white">
                <ChatInterface />
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-neutral-200 hover:bg-neutral-300 transition-colors" />

            {/* Right Panel - Preview/Code */}
            <ResizablePanel defaultSize={65}>
              <div className="h-full bg-neutral-50">
                {activeView === "preview" ? (
                  <div className="h-full bg-white">
                    <PreviewFrame />
                  </div>
                ) : (
                  <ResizablePanelGroup direction="horizontal" className="h-full">
                    {/* File Tree */}
                    <ResizablePanel defaultSize={25} minSize={15} maxSize={45}>
                      <div className="h-full bg-neutral-900 border-r border-neutral-700">
                        <FileTree />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-[1px] bg-neutral-700 hover:bg-neutral-600 transition-colors" />

                    {/* Code Editor */}
                    <ResizablePanel defaultSize={75}>
                      <div className="h-full bg-neutral-900">
                        <CodeEditor />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ChatProvider>
    </FileSystemProvider>
  );
}
