"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/api-client";

const demoProjects = [
  { id: "1", name: "My Website", description: "Company website built with Next.js", createdAt: "2026-01-15T00:00:00Z" },
  { id: "2", name: "E-commerce Store", description: "Online store with React frontend", createdAt: "2026-02-20T00:00:00Z" },
  { id: "3", name: "API Service", description: "Backend API for mobile apps", createdAt: "2026-03-10T00:00:00Z" },
  { id: "4", name: "SaaS Dashboard", description: "Customer dashboard for analytics", createdAt: "2026-04-05T00:00:00Z" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>(demoProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: projectData, loading, refetch } = useApi<any>("/api/projects/");

  useEffect(() => {
    if (projectData) {
      const list = Array.isArray(projectData) ? projectData : projectData.projects || [];
      if (list.length > 0) setProjects(list);
    }
  }, [projectData]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, organizationId: "00000000-0000-0000-0000-000000000000" }),
    });

    if (res.ok) {
      setShowCreate(false);
      setName("");
      setDescription("");
      refetch();
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    refetch();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-500">Manage your projects and resources</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createProject} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="My Awesome Project" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} placeholder="What is this project about?" />
          </div>
          <button type="submit" className="btn-primary">Create Project</button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 font-medium">No projects yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first project to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card p-6 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <Link href={`/projects/${project.id}`} className="font-semibold text-lg hover:text-brand-600 transition-colors">
                  {project.name}
                </Link>
                {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
                <p className="text-xs text-gray-400 mt-1">Created {new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => deleteProject(project.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
