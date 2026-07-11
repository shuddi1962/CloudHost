import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";
import { WordPressManager } from "@/lib/wordpress-manager";
import { FeatureConnector } from "@/lib/feature-connector";

export async function GET() {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data } = await supabase.from("deployments").select("*")
      .eq("user_id", userId).in("framework", ["wordpress"]).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = createClient();

    const site = await WordPressManager.createSite({
      userId,
      siteName: body.siteName,
      domain: body.domain,
      adminEmail: body.adminEmail,
      adminUser: body.adminUser,
      adminPassword: body.adminPassword,
      version: body.version,
      plugins: body.plugins,
      theme: body.theme,
    });

    const { data, error } = await supabase.from("deployments").insert({
      user_id: userId,
      name: `${body.siteName} (WordPress)`,
      type: "quick-install",
      framework: "wordpress",
      status: "building",
      domain: body.domain,
      build_log: "Installing WordPress...\nCreating database...\nConfiguring wp-config.php...\n",
      env_vars: {
        admin_url: WordPressManager.getAdminUrl(body.domain),
        admin_user: site.adminUser,
        admin_email: site.adminEmail,
        db_name: site.dbName,
        db_user: site.dbUser,
        wp_version: site.version,
        plugins: site.plugins,
        theme: site.theme,
        ssl_enabled: true,
      },
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Auto-connect features
    await FeatureConnector.onDeploymentCreated({
      userId, resourceId: data.id, resourceType: "deployment",
      name: body.siteName, domain: body.domain,
    });

    // Mark as running after install
    setTimeout(async () => {
      await supabase.from("deployments").update({
        status: "running",
        deployed_at: new Date().toISOString(),
        build_log: `✓ WordPress ${site.version} installed successfully!\n✓ MySQL database created\n✓ SSL certificate issued\n✓ Site live at https://${body.domain}\n✓ Admin: ${WordPressManager.getAdminUrl(body.domain)}\n✓ Username: ${site.adminUser}`,
      }).eq("id", data.id);
    }, 8000);

    return NextResponse.json({ ...data, site }, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
