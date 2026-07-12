"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [previews, setPreviews] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "deployments" | "databases" | "domains">("overview");

  useEffect(() => {
    if (!params?.id) return;
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [projRes, depRes, dbRes, domRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/projects/${id}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/deployments`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/databases`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/domains`, { headers }),
        ]);
        const projData = await projRes.json();
        const depData = await depRes.json();
        const dbData = await dbRes.json();
        const domData = await domRes.json();

        setProject(projData.project || projData);
        const projectDeps = (depData.deployments || []).filter((d: any) => d.projectId === id);
        setDeployments(projectDeps);
        setDatabases((dbData.databases || []).filter((d: any) => d.projectId === id));
        setPreviews((depData.deployments || []).filter((d: any) => d.projectId === id).slice(0, 3));
      } catch {
        // fallback
      }
      setLoading(false);
    };
    fetchAll();
  }, [params?.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading project...</div>;
  if (!project) return <div className="text-center py-12 text-gray-400">Project not found</div>;

  const prodDep = deployments.find(d => d.status === "running");
  const latestDep = deployments[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/projects")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className={`badge ${prodDep ? "badge-success" : "badge-warning"}`}>
                {prodDep ? "Live" : "No deployments"}
              </span>
            </div>
            {project.description && <p className="text-gray-500 text-sm">{project.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/deployments" className="btn-primary text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Deployment
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Deployments</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{deployments.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Databases</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{databases.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Domains</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">2</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Created</p>
          <p className="text-sm font-bold text-gray-700 mt-2">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Production Deployment Card */}
      {prodDep && (
        <div className="card overflow-hidden">
          <div className="card-header bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-semibold text-sm text-green-800">Production Deployment</span>
              </div>
              <a href={`https://${prodDep.url}`} target="_blank"
                className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {prodDep.url}
              </a>
            </div>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Framework</p>
                <p className="text-sm font-medium">{prodDep.framework}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Branch</p>
                <p className="text-sm font-medium">{prodDep.gitBranch || "main"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Updated</p>
                <p className="text-sm font-medium">{new Date(prodDep.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest Deployment Card */}
      {latestDep && (
        <Link href={`/deployments/${latestDep.id}`} className="card p-5 hover:shadow-md transition-shadow block group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${latestDep.framework === "Next.js" ? "bg-black" : latestDep.framework === "React" ? "bg-blue-400" : "bg-gray-600"} flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">{(latestDep.framework?.[0] || "A").toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold group-hover:text-brand-600 transition-colors">{latestDep.name}</p>
                <p className="text-xs text-gray-500">{latestDep.framework} · {latestDep.gitBranch || "main"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={`https://${latestDep.url}`} target="_blank" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-brand-200 transition-all">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit
              </a>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* Tabs: Overview | Deployments | Databases | Domains */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { key: "overview", label: "Overview", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { key: "deployments", label: `Deployments (${deployments.length})`, icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
            { key: "databases", label: `Databases (${databases.length})`, icon: "M4 7v10c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4z" },
            { key: "domains", label: "Domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "New Deployment", href: "/deployments", icon: "M12 4v16m8-8H4", desc: "Deploy from git or upload" },
                { label: "Provision Database", href: "/databases", icon: "M4 7v10c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4z", desc: "PostgreSQL, MySQL, Redis" },
                { label: "Add Domain", href: "/domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9", desc: "Custom domain or subdomain" },
                { label: "View Deployments", href: `/deployments`, icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", desc: "All deployment history" },
              ].map((action) => (
                <Link key={action.label} href={action.href} className="flex flex-col gap-1 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-brand-50 hover:border-brand-200 transition-all">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium mt-1">{action.label}</span>
                  <span className="text-[10px] text-gray-400">{action.desc}</span>
                </Link>
              ))}
            </div>

            {/* Git Info */}
            {prodDep?.gitRepository && (
              <div className="card p-5">
                <p className="text-sm font-medium mb-3">Git Repository</p>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{prodDep.gitRepository}</code>
                  <span className="text-gray-300">|</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{prodDep.gitBranch || "main"}</code>
                </div>
              </div>
            )}

            {/* Recent Deployments */}
            {deployments.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Recent Deployments</h3>
                  <Link href="/dashboard/deployments" className="text-xs text-brand-600 hover:text-brand-800">View all</Link>
                </div>
                <div className="space-y-2">
                  {deployments.slice(0, 5).map((dep) => (
                    <Link key={dep.id} href={`/deployments/${dep.id}`}
                      className="card p-3 flex items-center justify-between hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          dep.status === "running" ? "bg-green-500" :
                          dep.status === "failed" ? "bg-red-500" : "bg-gray-400"
                        }`} />
                        <span className="text-sm font-medium group-hover:text-brand-600 transition-colors">{dep.name}</span>
                        <span className="text-xs text-gray-400">{dep.framework}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(dep.updatedAt).toLocaleDateString()}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "deployments" && (
          <div className="space-y-2">
            {deployments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No deployments yet. Create your first deployment.</p>
                <Link href="/dashboard/deployments" className="text-brand-600 hover:text-brand-800 text-sm mt-2 inline-block">Go to Deployments</Link>
              </div>
            ) : (
              deployments.map((dep) => (
                <Link key={dep.id} href={`/deployments/${dep.id}`}
                  className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${
                      dep.framework === "Next.js" ? "bg-black" :
                      dep.framework === "React" ? "bg-blue-400" :
                      dep.framework === "Node.js" ? "bg-green-600" : "bg-gray-600"
                    } flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{(dep.framework?.[0] || "A").toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-brand-600 transition-colors">{dep.name}</p>
                      <p className="text-xs text-gray-500">{dep.gitBranch || "main"} · {new Date(dep.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs ${
                      dep.status === "running" ? "badge-success" :
                      dep.status === "failed" ? "badge-error" : "badge-warning"
                    }`}>{dep.status}</span>
                    <a href={`https://${dep.url}`} target="_blank" onClick={e => e.stopPropagation()}
                      className="text-xs text-brand-600 hover:text-brand-800 border border-gray-200 rounded-lg px-2.5 py-1 hover:border-brand-200 transition-all">
                      Visit
                    </a>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "databases" && (
          <div className="space-y-2">
            {databases.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No databases created for this project.</p>
                <Link href="/dashboard/databases" className="text-brand-600 hover:text-brand-800 text-sm mt-2 inline-block">Provision a Database</Link>
              </div>
            ) : (
              databases.map((db) => (
                <Link key={db.id} href={`/databases/${db.id}`}
                  className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${
                      db.type === "PostgreSQL" ? "bg-blue-700" :
                      db.type === "MySQL" ? "bg-orange-600" : "bg-red-500"
                    } flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{db.type?.[0] || "D"}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-brand-600 transition-colors">{db.name}</p>
                      <p className="text-xs text-gray-500">{db.type} {db.version} · {db.size}</p>
                    </div>
                  </div>
                  <span className={`badge text-xs ${db.status === "running" ? "badge-success" : "badge-warning"}`}>{db.status}</span>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "domains" && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <p className="text-gray-500 font-medium">Manage Domains</p>
            <p className="text-gray-400 text-sm mt-1">Connect custom domains to your deployments</p>
            <Link href="/dashboard/domains" className="btn-primary text-sm mt-4 inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Domain
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}