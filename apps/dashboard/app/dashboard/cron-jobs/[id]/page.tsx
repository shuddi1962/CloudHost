"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const demoJob = {
  id: "1", name: "Database Backup", description: "Daily database backup to S3",
  schedule: "0 2 * * *", method: "bash", command: "/usr/local/bin/backup-db.sh",
  url: "", timeout: 300, retryOnFailure: true, notifyOnFailure: true,
  email: "admin@example.com", status: "active",
  lastRun: "2026-07-10T02:00:00Z", lastRunStatus: "success", lastRunDuration: 45,
  createdAt: "2026-01-15T00:00:00Z",
  logs: [
    { id: "l1", status: "success", startedAt: "2026-07-10T02:00:00Z", finishedAt: "2026-07-10T02:00:45Z", duration: 45, trigger: "schedule", output: "Backup completed successfully\nDatabase size: 1.2 GB\nUploaded to s3://backups/db-2026-07-10.sql.gz" },
    { id: "l2", status: "success", startedAt: "2026-07-09T02:00:00Z", finishedAt: "2026-07-09T02:00:42Z", duration: 42, trigger: "schedule", output: "Backup completed successfully" },
    { id: "l3", status: "failed", startedAt: "2026-07-08T02:00:00Z", finishedAt: "2026-07-08T02:00:35Z", duration: 35, trigger: "schedule", output: "ERROR: Connection to database timed out\nCheck database server status" },
    { id: "l4", status: "success", startedAt: "2026-07-07T02:00:00Z", finishedAt: "2026-07-07T02:00:44Z", duration: 44, trigger: "manual", output: "Backup completed successfully" },
  ],
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };
  return (
    <span className={`badge ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === "active" || status === "success" ? "bg-green-500" : status === "paused" ? "bg-yellow-500" : "bg-red-500"
      }`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function CronJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:3001/api/cron-jobs/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJob(data.cronJob || data);
      } catch {
        setJob(demoJob);
      }
      setLoading(false);
    };
    if (params.id) fetchJob();
  }, [params.id]);

  const runNow = async () => {
    setRunning(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/cron-jobs/${params.id}/run`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setRunning(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading cron job...</div>;
  if (!job) return <div className="text-center py-12 text-gray-400">Cron job not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cron-jobs" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{job.name}</h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-sm text-gray-500">{job.description || "No description"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runNow} disabled={running} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            {running ? "Running..." : "Run Now"}
          </button>
          <Link href={`/dashboard/cron-jobs/${params.id}/edit`} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview" ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            Overview
          </button>
          <button onClick={() => setActiveTab("logs")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "logs" ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            Logs
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-header"><h2 className="font-semibold">Job Details</h2></div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Schedule</p>
                    <p className="font-mono text-sm mt-0.5">{job.schedule}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="text-sm mt-0.5 capitalize">{job.method}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">{job.method === "url" ? "URL" : "Command"}</p>
                    <p className="font-mono text-sm mt-0.5 break-all">{job.method === "url" ? job.url : job.command}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Timeout</p>
                    <p className="text-sm mt-0.5">{job.timeout}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm mt-0.5">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h2 className="font-semibold">Notifications</h2></div>
              <div className="card-body space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${job.retryOnFailure ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-sm">{job.retryOnFailure ? "Retry on failure enabled" : "Retry on failure disabled"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${job.notifyOnFailure ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-sm">{job.notifyOnFailure ? "Notify on failure enabled" : "Notify on failure disabled"}</span>
                </div>
                {job.notifyOnFailure && job.email && (
                  <p className="text-sm text-gray-500 ml-4">Email: {job.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="card-header"><h2 className="font-semibold">Last Run</h2></div>
              <div className="card-body space-y-3">
                {job.lastRun ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <StatusBadge status={job.lastRunStatus || job.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Started</span>
                      <span className="text-sm">{new Date(job.lastRun).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Duration</span>
                      <span className="text-sm">{job.lastRunDuration || "-"}s</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Never run</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h2 className="font-semibold">Quick Stats</h2></div>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Runs</span>
                  <span className="text-sm font-medium">{job.logs?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Success Rate</span>
                  <span className="text-sm font-medium">
                    {job.logs?.length
                      ? `${Math.round((job.logs.filter((l: any) => l.status === "success").length / job.logs.length) * 100)}%`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Started At</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Finished At</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Duration</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Trigger</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(job.logs || []).length > 0 ? (
                  (job.logs || []).map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3"><StatusBadge status={log.status} /></td>
                      <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{new Date(log.startedAt).toLocaleString()}</td>
                      <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{log.finishedAt ? new Date(log.finishedAt).toLocaleString() : "-"}</td>
                      <td className="px-6 py-3 text-gray-600">{log.duration}s</td>
                      <td className="px-6 py-3">
                        <span className={`badge ${log.trigger === "manual" ? "badge-info" : "badge-success"}`}>
                          {log.trigger}
                        </span>
                      </td>
                      <td className="px-6 py-3 max-w-xs">
                        <pre className="text-xs text-gray-600 truncate">{log.output?.split("\n")[0]}</pre>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">No log entries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
