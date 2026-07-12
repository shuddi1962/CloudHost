"use client";

import { useState, useEffect } from "react";

interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modifiedAt: string;
}

export default function FileManagerPage() {
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/list/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.items) setItems(data.items);
      else if (data.file) {
        setSelectedFile(data.file);
        setEditorContent(data.file.content);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFiles(""); }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
    fetchFiles(path);
  };

  const breadcrumbs = currentPath.split("/").filter(Boolean);

  const openFile = async (filePath: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();
      setSelectedFile({ path: filePath, content: data.content });
      setEditorContent(data.content);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filePath: selectedFile.path, content: editorContent }),
      });
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const createItem = async (type: "file" | "directory") => {
    const token = localStorage.getItem("token");
    const endpoint = type === "file" ? "/api/files/write" : "/api/files/create-directory";
    const body = type === "file"
      ? { filePath: currentPath ? `${currentPath}/${newName}` : newName, content: "" }
      : { filePath: currentPath ? `${currentPath}/${newName}` : newName };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setNewName("");
      setShowNewFile(false);
      setShowNewFolder(false);
      fetchFiles(currentPath);
    }
  };

  const deleteItem = async (itemPath: string) => {
    if (!confirm("Delete this item?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ filePath: itemPath }),
    });
    fetchFiles(currentPath);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith(".php")) return "text-indigo-600";
    if (name.endsWith(".html") || name.endsWith(".htm")) return "text-orange-600";
    if (name.endsWith(".css")) return "text-blue-600";
    if (name.endsWith(".js")) return "text-yellow-600";
    if (name.endsWith(".json")) return "text-green-600";
    if (name.endsWith(".md")) return "text-gray-600";
    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".svg")) return "text-pink-600";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-gray-500">Manage your website files — PHP, HTML, CSS, JS, WordPress files & more</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowNewFile(true); setShowNewFolder(false); }} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New File
          </button>
          <button onClick={() => { setShowNewFolder(true); setShowNewFile(false); }} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            New Folder
          </button>
        </div>
      </div>

      {(showNewFile || showNewFolder) && (
        <div className="card p-4 flex items-center gap-3">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            className="input-field flex-1" placeholder={showNewFile ? "filename.php" : "folder-name"} />
          <button onClick={() => createItem(showNewFile ? "file" : "directory")} className="btn-primary text-sm">Create</button>
          <button onClick={() => { setShowNewFile(false); setShowNewFolder(false); }} className="btn-secondary text-sm">Cancel</button>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <button onClick={() => navigateTo("")} className="hover:text-brand-600 transition-colors">Root</button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>/</span>
            <button
              onClick={() => navigateTo(breadcrumbs.slice(0, i + 1).join("/"))}
              className="hover:text-brand-600 transition-colors"
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedFile ? "lg:col-span-1" : "lg:col-span-3"} card`}>
          <div className="card-header flex justify-between items-center">
            <h2 className="font-semibold">Files</h2>
            <span className="text-xs text-gray-400">{items.length} items</span>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>Empty directory</p>
                <p className="text-xs mt-1">Create a new file or folder to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {currentPath && (
                  <button onClick={() => navigateTo(breadcrumbs.slice(0, -1).join("/"))}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    ..
                  </button>
                )}
                {items.map((item) => (
                  <div key={item.path} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group">
                    <button
                      onClick={() => item.type === "directory" ? navigateTo(item.path) : openFile(item.path)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      {item.type === "directory" ? (
                        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${getFileIcon(item.name)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-gray-400">{item.type === "file" ? formatSize(item.size) : ""}</span>
                      <button onClick={() => deleteItem(item.path)} className="text-gray-400 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="lg:col-span-2 card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h2 className="font-semibold">{selectedFile.path.split("/").pop()}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={saveFile} disabled={saving} className="btn-primary text-sm">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setSelectedFile(null)} className="btn-secondary text-sm">Close</button>
              </div>
            </div>
            <div className="card-body p-0">
              <textarea
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                className="w-full h-[500px] p-4 text-sm font-mono bg-gray-900 text-green-400 focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
