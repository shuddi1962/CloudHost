"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const token = localStorage.getItem("token");
    const fetchAll = async () => {
      try {
        const [projRes, depRes, dbRes] = await Promise.all([
          fetch(`http://localhost:3001/api/projects/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3001/api/deployments", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3001/api/databases", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const projData = await projRes.json();
        const depData = await depRes.json();
        const dbData = await dbRes.json();
        setProject(projData.project || projData);
        setDeployments((depData.deployments || []).filter((d: any) => d.projectId === params.id));
        setDatabases((dbData.databases || []).filter((d: any) => d.projectId === params.id));
      } catch {
        // fallback
      }
      setLoading(false);
    };
    fetchAll();
  }, [params?.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading project...</div>;
  if (!project) return <div className="text-center py-12 text-gray-400">Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/projects")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && <p className="text-gray-500">{project.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/deployments" className="btn-primary text-sm">New Deployment</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Deployments", value: deployments.length, color: "text-blue-600" },
          { label: "Databases", value: databases.length, color: "text-green-600" },
          { label: "Domains", value: "—", color: "text-purple-600" },
          { label: "Created", value: new Date(project.createdAt).toLocaleDateString(), color: "text-gray-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {deployments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Deployments</h2>
          <div className="space-y-2">
            {deployments.map((dep) => (
              <Link key={dep.id} href={`/deployments/${dep.id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <span className="font-medium group-hover:text-brand-600 transition-colors">{dep.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{dep.framework} · {dep.gitBranch || "main"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${dep.status === "running" ? "badge-success" : dep.status === "failed" ? "badge-error" : "badge-warning"}`}>
                    {dep.status}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {databases.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Databases</h2>
          <div className="space-y-2">
            {databases.map((db) => (
              <Link key={db.id} href={`/databases/${db.id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <span className="font-medium group-hover:text-brand-600 transition-colors">{db.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{db.type} {db.version} · {db.size}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${db.status === "running" ? "badge-success" : "badge-warning"}`}>{db.status}</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Deployment", href: "/deployments", icon: "M12 4v16m8-8H4" },
            { label: "Provision Database", href: "/databases", icon: "M4 7v10c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4z" },
            { label: "Add Domain", href: "/domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" },
            { label: "View Logs", href: `/deployments`, icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-brand-50 hover:border-brand-200 transition-all">
              <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}