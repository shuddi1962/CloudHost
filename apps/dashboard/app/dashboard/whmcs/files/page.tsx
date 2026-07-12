"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modifiedAt: string;
  mime: string;
  perms: string;
}

const allDirs = [
  { name: "bin", path: "/home/khdemoco/bin" },
  { name: "enter-the-path", path: "/home/khdemoco/enter-the-path" },
  { name: "etc", path: "/home/khdemoco/etc" },
  { name: "logs", path: "/home/khdemoco/logs" },
  { name: "lscache", path: "/home/khdemoco/lscache" },
  { name: "mail", path: "/home/khdemoco/mail" },
  { name: "perl", path: "/home/khdemoco/perl" },
  { name: "php", path: "/home/khdemoco/php" },
  { name: "public_ftp", path: "/home/khdemoco/public_ftp" },
  { name: "public_html", path: "/home/khdemoco/public_html" },
  { name: "repositories", path: "/home/khdemoco/repositories" },
  { name: "ssl", path: "/home/khdemoco/ssl" },
  { name: "tmp", path: "/home/khdemoco/tmp" },
  { name: "var", path: "/home/khdemoco/var" },
];

const mockFiles: Record<string, FileItem[]> = {
  "/home/khdemoco/public_html": [
    { name: "index.html", path: "/home/khdemoco/public_html/index.html", type: "file", size: 6453, modifiedAt: "Aug 27, 2021, 7:03 PM", mime: "text/html", perms: "0644" },
    { name: "style.css", path: "/home/khdemoco/public_html/style.css", type: "file", size: 12450, modifiedAt: "Aug 27, 2021, 6:55 PM", mime: "text/css", perms: "0644" },
    { name: "app.js", path: "/home/khdemoco/public_html/app.js", type: "file", size: 28410, modifiedAt: "Aug 27, 2021, 6:50 PM", mime: "application/javascript", perms: "0644" },
    { name: "wp-config.php", path: "/home/khdemoco/public_html/wp-config.php", type: "file", size: 3841, modifiedAt: "Aug 27, 2021, 6:45 PM", mime: "text/x-php", perms: "0600" },
    { name: "images", path: "/home/khdemoco/public_html/images", type: "directory", size: 4096, modifiedAt: "Aug 27, 2021, 6:30 PM", mime: "httpd/unix-directory", perms: "0755" },
    { name: "about.html", path: "/home/khdemoco/public_html/about.html", type: "file", size: 8921, modifiedAt: "Aug 26, 2021, 2:15 PM", mime: "text/html", perms: "0644" },
    { name: "robots.txt", path: "/home/khdemoco/public_html/robots.txt", type: "file", size: 126, modifiedAt: "Aug 25, 2021, 10:00 AM", mime: "text/plain", perms: "0644" },
    { name: ".htaccess", path: "/home/khdemoco/public_html/.htaccess", type: "file", size: 843, modifiedAt: "Aug 24, 2021, 4:30 PM", mime: "text/plain", perms: "0644" },
    { name: "assets", path: "/home/khdemoco/public_html/assets", type: "directory", size: 4096, modifiedAt: "Aug 23, 2021, 11:20 AM", mime: "httpd/unix-directory", perms: "0755" },
    { name: "error_log", path: "/home/khdemoco/public_html/error_log", type: "file", size: 145820, modifiedAt: "Aug 27, 2021, 7:00 PM", mime: "text/plain", perms: "0644" },
  ],
};

export default function WhmcsFileManagerPage() {
  const [currentPath, setCurrentPath] = useState("/home/khdemoco/public_html");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(["/home/khdemoco", "/home/khdemoco/public_html"]));
  const [sortCol, setSortCol] = useState<"name" | "size" | "modified" | "type" | "perms">("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewTrash, setViewTrash] = useState(false);

  useEffect(() => {
    setFiles(mockFiles[currentPath] || []);
  }, [currentPath]);

  const toggleDir = (path: string) => {
    const next = new Set(expandedDirs);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedDirs(next);
  };

  const navigateDir = (path: string) => {
    setCurrentPath(path);
    setSelected(new Set());
  };

  const toggleSelect = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === files.length) setSelected(new Set());
    else setSelected(new Set(files.map((f) => f.name)));
  };

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const sortedFiles = [...files].sort((a, b) => {
    const dirsFirst = (a.type === "directory" ? 0 : 1) - (b.type === "directory" ? 0 : 1);
    if (dirsFirst !== 0) return dirsFirst;
    let cmp = 0;
    if (sortCol === "name") cmp = a.name.localeCompare(b.name);
    else if (sortCol === "size") cmp = a.size - b.size;
    else if (sortCol === "modified") cmp = a.modifiedAt.localeCompare(b.modifiedAt);
    else if (sortCol === "type") cmp = a.mime.localeCompare(b.mime);
    else if (sortCol === "perms") cmp = a.perms.localeCompare(b.perms);
    return sortAsc ? cmp : -cmp;
  });

  const breadcrumbs = currentPath.split("/").filter(Boolean);
  const dirTree = allDirs.filter((d) => d.path.startsWith("/home/khdemoco"));

  const getFileIcon = (name: string) => {
    if (name.endsWith(".php")) return "text-indigo-500";
    if (name.endsWith(".html") || name.endsWith(".htm")) return "text-orange-500";
    if (name.endsWith(".css")) return "text-blue-500";
    if (name.endsWith(".js")) return "text-yellow-500";
    if (name.endsWith(".json")) return "text-green-500";
    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".svg")) return "text-pink-500";
    if (name.endsWith(".txt") || name.endsWith(".md")) return "text-gray-500";
    return "text-gray-400";
  };

  const renderDirTree = (parentPath: string, depth = 0) => {
    return dirTree
      .filter((d) => d.path === parentPath || d.path.startsWith(parentPath + "/") && d.path.split("/").length === parentPath.split("/").length + 1)
      .map((d) => {
        const isExpanded = expandedDirs.has(d.path);
        const isCurrent = d.path === currentPath;
        const hasChildren = dirTree.some((c) => c.path.startsWith(d.path + "/") && c.path !== d.path);
        return (
          <div key={d.path}>
            <button
              onClick={() => { navigateDir(d.path); if (hasChildren) toggleDir(d.path); }}
              className={`w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs rounded transition-colors ${isCurrent ? "bg-[#1c3f66]/10 text-[#1c3f66] font-medium" : "text-gray-600 hover:bg-gray-100"}`}
              style={{ paddingLeft: `${8 + depth * 14}px` }}
            >
              {hasChildren ? (
                <svg className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              ) : (
                <span className="w-3" />
              )}
              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isExpanded ? "text-yellow-500" : "text-yellow-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              <span className="truncate">{d.name}</span>
            </button>
            {isExpanded && renderDirTree(d.path, depth + 1)}
          </div>
        );
      });
  };

  return (
    <div className="text-[13px]">
      {/* Top Toolbar */}
      <div className="bg-[#1c3f66] rounded-t-lg px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          <span className="text-white text-sm font-medium">File Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-[11px] bg-white/10 text-white border border-white/20 rounded px-2 py-1">
            <option className="text-gray-800">All Your Files</option>
          </select>
          <div className="flex items-center bg-white/10 rounded border border-white/20">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="for..." className="w-32 bg-transparent text-white text-xs px-2 py-1 placeholder-white/40 outline-none" />
            <button className="px-2 py-1 text-white/60 hover:text-white"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
          </div>
          <button className="text-[11px] text-white border border-white/30 rounded px-2.5 py-1 hover:bg-white/10 transition-colors">⚙ Settings</button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-x border-gray-200 px-3 py-2 flex items-center gap-1 flex-wrap">
        {[
          { label: "File", icon: "M12 4v16m8-8H4" },
          { label: "Folder", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
          { label: "Copy", icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" },
          { label: "Move", icon: "M14 5l7 7m0 0l-7 7m7-7H3" },
          { label: "Upload", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
          { label: "Download", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          { label: "Delete", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
          { label: "Restore", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
          { label: "Rename", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
          { label: "Edit", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
          { label: "HTML Editor", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
          { label: "Permissions", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
          { label: "View", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
          { label: "Extract", icon: "M14 5l7 7m0 0l-7 7m7-7H3" },
          { label: "Compress", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
        ].map((action, i) => (
          <button key={i} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${i >= 5 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} /></svg>
            {action.label}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-x border-gray-200 px-4 py-2 flex items-center gap-2 text-xs">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        <button onClick={() => navigateDir("/home/khdemoco")} className="text-gray-500 hover:text-[#1c3f66]">Home</button>
        {breadcrumbs.map((crumb, i) => {
          const path = "/" + breadcrumbs.slice(0, i + 1).join("/");
          return (
            <span key={i} className="flex items-center gap-1">
              <span className="text-gray-300">/</span>
              <button onClick={() => navigateDir(path)} className={`hover:text-[#1c3f66] ${path === currentPath ? "text-[#1c3f66] font-medium" : "text-gray-500"}`}>{crumb}</button>
            </span>
          );
        })}
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => navigateDir(currentPath)} className="text-gray-400 hover:text-[#1c3f66] text-[11px]">Collapse All</button>
        </div>
      </div>

      {/* Secondary Nav */}
      <div className="bg-[#eaf3fb] border-x border-gray-200 px-4 py-1.5 flex items-center gap-4 text-xs">
        {["Home", "Up One Level", "Back", "Forward", "Reload", "Select All", "Unselect All", "View Trash", "Empty Trash"].map((item) => (
          <button key={item}
            onClick={() => {
              if (item === "Home") navigateDir("/home/khdemoco");
              if (item === "Up One Level") navigateDir(currentPath.split("/").slice(0, -1).join("/") || "/");
              if (item === "Reload") setFiles([...mockFiles[currentPath] || []]);
              if (item === "Select All") toggleSelectAll();
              if (item === "Unselect All") setSelected(new Set());
              if (item === "View Trash") setViewTrash(!viewTrash);
              if (item === "Back" || item === "Forward") { /* history nav */ }
            }}
            className="text-gray-600 hover:text-[#1c3f66] transition-colors">
            {item}
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-gray-200 rounded-b-lg">
        <div className="flex">
          {/* Directory Tree Sidebar */}
          <div className="w-56 border-r border-gray-200 p-2 space-y-0.5 overflow-y-auto max-h-[520px] bg-gray-50/50 hidden md:block">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 pb-1 font-medium">(/home/khdemoco)</p>
            {renderDirTree("/home/khdemoco")}
          </div>

          {/* File List */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-8 px-3 py-2 text-left">
                    <input type="checkbox" checked={selected.size === files.length && files.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 py-2 text-left cursor-pointer hover:text-[#1c3f66]" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1 font-medium text-gray-600 text-[11px] uppercase">Name {sortCol === "name" && <span className="text-[#1c3f66]">{sortAsc ? "↑" : "↓"}</span>}</div>
                  </th>
                  <th className="px-3 py-2 text-right cursor-pointer hover:text-[#1c3f66]" onClick={() => handleSort("size")}>
                    <div className="flex items-center justify-end gap-1 font-medium text-gray-600 text-[11px] uppercase">Size {sortCol === "size" && <span className="text-[#1c3f66]">{sortAsc ? "↑" : "↓"}</span>}</div>
                  </th>
                  <th className="px-3 py-2 text-left cursor-pointer hover:text-[#1c3f66]" onClick={() => handleSort("modified")}>
                    <div className="flex items-center gap-1 font-medium text-gray-600 text-[11px] uppercase">Last Modified {sortCol === "modified" && <span className="text-[#1c3f66]">{sortAsc ? "↑" : "↓"}</span>}</div>
                  </th>
                  <th className="px-3 py-2 text-left cursor-pointer hover:text-[#1c3f66]" onClick={() => handleSort("type")}>
                    <div className="flex items-center gap-1 font-medium text-gray-600 text-[11px] uppercase">Type {sortCol === "type" && <span className="text-[#1c3f66]">{sortAsc ? "↑" : "↓"}</span>}</div>
                  </th>
                  <th className="px-3 py-2 text-right cursor-pointer hover:text-[#1c3f66]" onClick={() => handleSort("perms")}>
                    <div className="flex items-center justify-end gap-1 font-medium text-gray-600 text-[11px] uppercase">Permissions {sortCol === "perms" && <span className="text-[#1c3f66]">{sortAsc ? "↑" : "↓"}</span>}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFiles.map((file) => {
                  const isSel = selected.has(file.name);
                  return (
                    <tr key={file.name}
                      onClick={() => file.type === "directory" ? navigateDir(file.path) : toggleSelect(file.name)}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${isSel ? "bg-[#eaf3fb] border-l-2 border-l-[#1c3f66]" : "hover:bg-[#f4f6f8]"}`}>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleSelect(file.name)} className="rounded border-gray-300" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {file.type === "directory" ? (
                            <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                          ) : (
                            <svg className={`w-4 h-4 ${getFileIcon(file.name)} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          )}
                          <span className="text-xs font-medium text-gray-800">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-500 text-[11px] whitespace-nowrap">{file.type === "directory" ? "-" : formatSize(file.size)}</td>
                      <td className="px-3 py-2 text-gray-500 text-[11px] whitespace-nowrap">{file.modifiedAt}</td>
                      <td className="px-3 py-2 text-gray-500 text-[11px]">{file.type === "directory" ? "Directory" : file.mime}</td>
                      <td className="px-3 py-2 text-right text-gray-500 text-[11px] font-mono">{file.perms}</td>
                    </tr>
                  );
                })}
                {sortedFiles.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-xs">This directory is empty</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-4">
        <Link href="/dashboard/whmcs/cpanel" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to cPanel</Link>
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
