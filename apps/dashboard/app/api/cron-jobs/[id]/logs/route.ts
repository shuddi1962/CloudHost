import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const demoLogs: Record<string, any[]> = {
  "cj-001": [
    { id: "log-001", cron_job_id: "cj-001", status: "success", output: "Database backup completed: 2.4 GB compressed to 856 MB", error_message: "", started_at: "2026-07-11T02:00:00Z", finished_at: "2026-07-11T02:04:23Z", duration_ms: 263000, trigger: "scheduled" },
    { id: "log-002", cron_job_id: "cj-001", status: "success", output: "Database backup completed: 2.4 GB compressed to 842 MB", error_message: "", started_at: "2026-07-10T02:00:00Z", finished_at: "2026-07-10T02:03:55Z", duration_ms: 235000, trigger: "scheduled" },
    { id: "log-004", cron_job_id: "cj-001", status: "failed", output: "Backup failed: disk full", error_message: "write error: No space left on device", started_at: "2026-07-09T02:00:00Z", finished_at: "2026-07-09T02:00:12Z", duration_ms: 12000, trigger: "scheduled" },
  ],
  "cj-002": [
    { id: "log-003", cron_job_id: "cj-002", status: "success", output: "All services healthy (12/12)", error_message: "", started_at: "2026-07-11T13:55:00Z", finished_at: "2026-07-11T13:55:03Z", duration_ms: 3000, trigger: "scheduled" },
  ],
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(demoLogs[params.id] || []);

    const { data, error } = await supabase.from("cron_job_logs").select("*")
      .eq("cron_job_id", params.id).order("started_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(demoLogs[params.id] || []);
  }
}
