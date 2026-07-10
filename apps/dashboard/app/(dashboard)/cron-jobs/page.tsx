"use client";

import { useEffect, useState } from "react";

const commonSchedules = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 30 minutes", value: "*/30 * * * *" },
  { label: "Hourly", value: "0 * * * *" },
  { label: "Daily (midnight)", value: "0 0 * * *" },
  { label: "Weekly (Sunday)", value: "0 0 * * 0" },
  { label: "Monthly (1st)", value: "0 0 1 * *" },
  { label: "Custom", value: "custom" },
];

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ command: "", schedule: "0 * * * *" });
  const [customCron, setCustomCron] = useState("");

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/hosting/account/00000000-0000-0000-0000-000000000000/cron", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data.cronJobs || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/hosting/cron", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        hostingAccountId: "00000000-0000-0000-0000-000000000000",
        command: form.command,
        schedule: form.schedule === "custom" ? customCron : form.schedule,
      }),
    });
    setShowCreate(false);
    setForm({ command: "", schedule: "0 * * * *" });
    fetchJobs();
  };

  const toggleJob = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/hosting/cron/${id}/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchJobs();
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Delete this cron job?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/hosting/cron/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchJobs();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading cron jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <p className="text-gray-500">Schedule automated tasks to run at specific times</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Cron Job
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createJob} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Command</label>
            <input value={form.command} onChange={e => setForm({ ...form, command: e.target.value })}
              className="input-field font-mono text-sm" placeholder="/usr/bin/php /home/user/script.php" required />
            <p className="text-xs text-gray-400 mt-1">Full path to the command or script to execute</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Schedule</label>
            <select value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="input-field">
              {commonSchedules.map(s => <option key={s.value} value={s.value}>{s.label} ({s.value})</option>)}
            </select>
          </div>
          {form.schedule === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-1">Cron Expression</label>
              <input value={customCron} onChange={e => setCustomCron(e.target.value)}
                className="input-field font-mono" placeholder="*/5 * * * *" />
              <p className="text-xs text-gray-400 mt-1">Format: minute hour day month weekday</p>
            </div>
          )}
          <button type="submit" className="btn-primary">Create Cron Job</button>
        </form>
      )}

      <div className="space-y-3">
        {jobs.map((job) => {
          const scheduleLabel = commonSchedules.find(s => s.value === job.schedule);
          return (
            <div key={job.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${job.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                    <h3 className="font-semibold font-mono text-sm">{job.command}</h3>
                    <span className="badge badge-info text-[10px]">{scheduleLabel?.label || job.schedule}</span>
                  </div>
                  <code className="text-xs text-gray-400">{job.schedule}</code>
                  {job.lastRunAt && <span className="text-xs text-gray-400 ml-3">Last run: {new Date(job.lastRunAt).toLocaleString()}</span>}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => toggleJob(job.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${job.status === "active" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                    {job.status === "active" ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => deleteJob(job.id)} className="text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No cron jobs</p>
            <p className="text-gray-400 text-sm mt-1">Schedule automated tasks like backups, email reports, or maintenance scripts</p>
          </div>
        </div>
      )}
    </div>
  );
}
