import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: job, error: fetchError } = await supabase.from("cron_jobs").select("*")
      .eq("id", params.id).eq("user_id", user.id).single();
    if (fetchError || !job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Log the run
    const { data: log, error: logError } = await supabase.from("cron_job_logs").insert({
      cron_job_id: params.id,
      status: "running",
      started_at: new Date().toISOString(),
      trigger: "manual",
    }).select().single();

    await supabase.from("cron_jobs").update({
      last_status: "running",
      last_run_at: new Date().toISOString(),
    }).eq("id", params.id);

    // Simulate execution
    setTimeout(async () => {
      const success = Math.random() > 0.2;
      const finishedAt = new Date().toISOString();
      const duration = Math.floor(Math.random() * 30000) + 1000;

      await supabase.from("cron_job_logs").update({
        status: success ? "success" : "failed",
        output: success ? `Job "${job.name}" executed successfully` : "",
        error_message: success ? "" : "Simulated execution failure",
        finished_at: finishedAt,
        duration_ms: duration,
      }).eq("id", log?.id);

      await supabase.from("cron_jobs").update({
        last_status: success ? "success" : "failed",
        updated_at: finishedAt,
      }).eq("id", params.id);
    }, 2000);

    return NextResponse.json({ message: "Job triggered", log_id: log?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
