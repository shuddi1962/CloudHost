"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const schedulePresets = [
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Weekly on Monday", value: "0 0 * * 1" },
];

const demoJob = {
  id: "1", name: "Database Backup", description: "Daily database backup to S3",
  schedule: "0 2 * * *", command: "/usr/local/bin/backup-db.sh", method: "bash",
  url: "", timeout: 300, retryOnFailure: true, notifyOnFailure: true,
  email: "admin@example.com", status: "active",
};

export default function EditCronJobPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", schedule: "0 * * * *", command: "",
    method: "bash", url: "", timeout: 60,
    retryOnFailure: true, notifyOnFailure: false, email: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/cron-jobs/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const job = data.cronJob || data;
        setForm({
          name: job.name || "",
          description: job.description || "",
          schedule: job.schedule || "0 * * * *",
          command: job.command || "",
          method: job.method || "bash",
          url: job.url || "",
          timeout: job.timeout || 60,
          retryOnFailure: job.retryOnFailure ?? true,
          notifyOnFailure: job.notifyOnFailure ?? false,
          email: job.email || "",
        });
      } catch {
        setForm({
          name: demoJob.name, description: demoJob.description,
          schedule: demoJob.schedule, command: demoJob.command,
          method: demoJob.method, url: demoJob.url, timeout: demoJob.timeout,
          retryOnFailure: demoJob.retryOnFailure, notifyOnFailure: demoJob.notifyOnFailure,
          email: demoJob.email,
        });
      }
      setLoading(false);
    };
    if (params.id) fetchJob();
  }, [params.id]);

  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/cron-jobs/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      router.push(`/dashboard/cron-jobs/${params.id}`);
    } catch {
      router.push(`/dashboard/cron-jobs/${params.id}`);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading cron job...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/cron-jobs/${params.id}`} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Cron Job</h1>
          <p className="text-sm text-gray-500">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-body space-y-5">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={e => update("name", e.target.value)}
                className="input-field" placeholder="e.g. Database Backup" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={e => update("description", e.target.value)}
                className="input-field" rows={3} placeholder="Optional description of what this job does" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Schedule</label>
              <input value={form.schedule} onChange={e => update("schedule", e.target.value)}
                className="input-field font-mono mb-2" placeholder="*/5 * * * *" />
              <div className="flex flex-wrap gap-2">
                {schedulePresets.map(p => (
                  <button key={p.value} type="button" onClick={() => update("schedule", p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.schedule === p.value
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Cron expression format: minute hour day month weekday</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-5">
            <h2 className="text-lg font-semibold">Command</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select value={form.method} onChange={e => update("method", e.target.value)} className="input-field">
                <option value="bash">Bash</option>
                <option value="php">PHP</option>
                <option value="python">Python</option>
                <option value="node">Node.js</option>
                <option value="url">URL</option>
              </select>
            </div>

            {form.method === "url" ? (
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input value={form.url} onChange={e => update("url", e.target.value)}
                  className="input-field font-mono" placeholder="https://example.com/cron-endpoint" required />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Command</label>
                <input value={form.command} onChange={e => update("command", e.target.value)}
                  className="input-field font-mono" placeholder="/usr/bin/php /home/user/script.php" required />
                <p className="text-xs text-gray-400 mt-1">Full command or path to the script to execute</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Timeout (seconds)</label>
              <input type="number" value={form.timeout} onChange={e => update("timeout", parseInt(e.target.value) || 60)}
                className="input-field w-32" min={1} max={3600} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-5">
            <h2 className="text-lg font-semibold">Notifications</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.retryOnFailure} onChange={e => update("retryOnFailure", e.target.checked)}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500" />
              <div>
                <span className="text-sm font-medium">Retry on failure</span>
                <p className="text-xs text-gray-400">Automatically retry the job up to 3 times if it fails</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifyOnFailure} onChange={e => update("notifyOnFailure", e.target.checked)}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500" />
              <div>
                <span className="text-sm font-medium">Notify on failure</span>
                <p className="text-xs text-gray-400">Send an email notification when the job fails</p>
              </div>
            </label>

            {form.notifyOnFailure && (
              <div>
                <label className="block text-sm font-medium mb-1">Email for notifications</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  className="input-field" placeholder="admin@example.com" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href={`/dashboard/cron-jobs/${params.id}`} className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
