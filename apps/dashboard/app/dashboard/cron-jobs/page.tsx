"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const demoJobs = [
  { id: "1", name: "Database Backup", description: "Daily database backup to S3", schedule: "0 2 * * *", method: "bash", command: "/usr/local/bin/backup-db.sh", timeout: 300, retryOnFailure: true, notifyOnFailure: true, email: "admin@example.com", status: "active", lastRun: "2026-07-10T02:00:00Z", lastRunStatus: "success", lastRunDuration: 45, createdAt: "2026-01-15T00:00:00Z" },
  { id: "2", name: "Health Check", description: "Monitor server health and uptime", schedule: "*/5 * * * *", method: "url", url: "https://api.example.com/health", command: "", timeout: 30, retryOnFailure: true, notifyOnFailure: false, email: "", status: "active", lastRun: "2026-07-11T10:25:00Z", lastRunStatus: "success", lastRunDuration: 2, createdAt: "2026-03-01T00:00:00Z" },
  { id: "3", name: "Weekly Report", description: "Generate and email weekly analytics", schedule: "0 8 * * 1", method: "php", command: "/usr/bin/php /home/site/artisan report:weekly", timeout: 120, retryOnFailure: false, notifyOnFailure: true, email: "reports@example.com", status: "paused", lastRun: "2026-07-06T08:00:00Z", lastRunStatus: "failed", lastRunDuration: 90, createdAt: "2026-02-10T00:00:00Z" },
];

const scheduleLabels: Record<string, string> = {
  "0 2 * * *": "Daily at 2:00 AM",
  "*/5 * * * *": "Every 5 minutes",
  "0 8 * * 1": "Weekly on Monday at 8:00 AM",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span className={`badge ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === "active" ? "bg-green-500" : status === "paused" ? "bg-yellow-500" : "bg-red-500"
      }`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cron-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data.cronJobs || []);
    } catch {
      setJobs(demoJobs);
    }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const deleteJob = async (id: string) => {
    if (!confirm("Delete this cron job?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cron-jobs/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs();
    } catch {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const runNow = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cron-jobs/${id}/run`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading cron jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <p className="text-gray-500">Schedule automated tasks to run at specific times</p>
        </div>
        <Link href="/dashboard/cron-jobs/create" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Cron Job
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Schedule</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Last Run</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/cron-jobs/${job.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                        {job.name}
                      </Link>
                      {job.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{job.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-600">{job.schedule}</span>
                      {scheduleLabels[job.schedule] && (
                        <p className="text-xs text-gray-400 mt-0.5">{scheduleLabels[job.schedule]}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {job.lastRun ? (
                        <div>
                          <span className="text-gray-600">{new Date(job.lastRun).toLocaleDateString()} {new Date(job.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {job.lastRunDuration && (
                            <p className="text-xs text-gray-400 mt-0.5">{job.lastRunDuration}s</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.lastRunStatus === "failed" ? "failed" : job.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => runNow(job.id)} title="Run Now"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <Link href={`/dashboard/cron-jobs/${job.id}/edit`} title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <Link href={`/dashboard/cron-jobs/${job.id}`} title="View Logs"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Link>
                        <button onClick={() => deleteJob(job.id)} title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No cron jobs yet</p>
            <p className="text-gray-400 text-sm mt-1">Schedule automated tasks like backups, email reports, or maintenance scripts</p>
            <Link href="/dashboard/cron-jobs/create" className="btn-primary mt-4 inline-flex">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Cron Job
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
