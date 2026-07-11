import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const demoJobs = [
  {
    id: "cj-001", name: "Database Backup", description: "Daily backup of all databases",
    schedule: "0 2 * * *", command: "pg_dump -U postgres -Fc mydb > /backups/db-$(date +%Y%m%d).dump",
    method: "bash", status: "active", last_run_at: "2026-07-11T02:00:00Z", last_status: "success",
    next_run_at: "2026-07-12T02:00:00Z", timeout_seconds: 600, retry_on_failure: true, max_retries: 3,
    notify_on_failure: true, created_at: "2026-06-01T00:00:00Z", updated_at: "2026-07-11T02:05:00Z",
  },
  {
    id: "cj-002", name: "Health Check", description: "Monitor all services every 5 minutes",
    schedule: "*/5 * * * *", command: "curl -f https://status.cloudhost.app/health || slack-cli alert 'Service down'",
    method: "bash", status: "active", last_run_at: "2026-07-11T14:00:00Z", last_status: "success",
    next_run_at: "2026-07-11T14:05:00Z", timeout_seconds: 30, retry_on_failure: true, max_retries: 2,
    notify_on_failure: true, created_at: "2026-05-15T00:00:00Z", updated_at: "2026-07-11T14:00:05Z",
  },
  {
    id: "cj-003", name: "SSL Renewal Check", description: "Check SSL certificates expiring within 30 days",
    schedule: "0 6 * * 1", command: "/usr/local/bin/check-ssl --expiry 30 --alert",
    method: "bash", status: "active", last_run_at: "2026-07-07T06:00:00Z", last_status: "failed",
    next_run_at: "2026-07-14T06:00:00Z", timeout_seconds: 120, retry_on_failure: true, max_retries: 3,
    notify_on_failure: true, created_at: "2026-04-10T00:00:00Z", updated_at: "2026-07-07T06:02:00Z",
  },
  {
    id: "cj-004", name: "Log Rotation", description: "Rotate and compress application logs",
    schedule: "0 3 * * *", command: "logrotate -f /etc/logrotate.d/app",
    method: "bash", status: "paused", last_run_at: "2026-07-10T03:00:00Z", last_status: "success",
    next_run_at: null, timeout_seconds: 300, retry_on_failure: false, max_retries: 1,
    notify_on_failure: false, created_at: "2026-03-01T00:00:00Z", updated_at: "2026-07-10T03:05:00Z",
  },
  {
    id: "cj-005", name: "Sync CDN Cache", description: "Invalidate CDN cache for updated content",
    schedule: "0 */4 * * *", command: "curl -X POST https://api.cloudflare.com/client/v4/zones/ZONE/purge_cache",
    method: "url", url: "https://api.cloudflare.com/client/v4/zones/ZONE/purge_cache",
    status: "active", last_run_at: "2026-07-11T12:00:00Z", last_status: "success",
    next_run_at: "2026-07-11T16:00:00Z", timeout_seconds: 60, retry_on_failure: true, max_retries: 3,
    notify_on_failure: false, created_at: "2026-02-15T00:00:00Z", updated_at: "2026-07-11T12:00:10Z",
  },
];

const demoLogs: Record<string, any[]> = {
  "cj-001": [
    { id: "log-001", cron_job_id: "cj-001", status: "success", output: "Database backup completed: 2.4 GB compressed to 856 MB", started_at: "2026-07-11T02:00:00Z", finished_at: "2026-07-11T02:04:23Z", duration_ms: 263000, trigger: "scheduled" },
    { id: "log-002", cron_job_id: "cj-001", status: "success", output: "Database backup completed: 2.4 GB compressed to 842 MB", started_at: "2026-07-10T02:00:00Z", finished_at: "2026-07-10T02:03:55Z", duration_ms: 235000, trigger: "scheduled" },
    { id: "log-003", cron_job_id: "cj-001", status: "failed", output: "Backup failed: disk full", error_message: "write error: No space left on device", started_at: "2026-07-09T02:00:00Z", finished_at: "2026-07-09T02:00:12Z", duration_ms: 12000, trigger: "scheduled" },
  ],
  "cj-003": [
    { id: "log-004", cron_job_id: "cj-003", status: "failed", output: "", error_message: "SSL certificate acme.com expires in 12 days", started_at: "2026-07-07T06:00:00Z", finished_at: "2026-07-07T06:00:08Z", duration_ms: 8000, trigger: "scheduled" },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(demoJobs);

    let query = supabase.from("cron_jobs").select("*").eq("user_id", user.id);
    if (status) query = query.eq("status", status);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    let result = demoJobs;
    if (status) result = result.filter((j) => j.status === status);
    return NextResponse.json(result);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase.from("cron_jobs").insert({
      user_id: user.id,
      name: body.name,
      description: body.description || "",
      schedule: body.schedule,
      command: body.command,
      method: body.method || "bash",
      url: body.url || null,
      status: "active",
      timeout_seconds: body.timeout_seconds || 300,
      retry_on_failure: body.retry_on_failure ?? true,
      max_retries: body.max_retries || 3,
      notify_on_failure: body.notify_on_failure ?? true,
      notify_email: body.notify_email || null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
