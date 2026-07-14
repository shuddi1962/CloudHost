DO $$ BEGIN
 CREATE TYPE "public"."cf_workflow_status" AS ENUM('active', 'paused', 'completed', 'failed', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."container_status" AS ENUM('running', 'stopped', 'deploying', 'failed', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."durable_object_status" AS ENUM('active', 'inactive', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."pages_build_status" AS ENUM('queued', 'building', 'deploying', 'deployed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sandbox_status" AS ENUM('running', 'stopped', 'expired', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."worker_runtime" AS ENUM('javascript', 'typescript', 'python', 'rust', 'wasm');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."worker_status" AS ENUM('active', 'inactive', 'deploying', 'failed', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."bucket_visibility" AS ENUM('public', 'private');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."d1_status" AS ENUM('active', 'deleted', 'creating', 'error');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hyperdrive_status" AS ENUM('connected', 'disconnected', 'error');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."queue_type" AS ENUM('fifo', 'standard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."agent_status" AS ENUM('idle', 'running', 'paused', 'error', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ai_gateway_status" AS ENUM('active', 'paused', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ai_model_status" AS ENUM('available', 'deprecated', 'beta');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ssl_type" AS ENUM('universal', 'custom', 'advanced', 'keyless');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."waf_action" AS ENUM('block', 'challenge', 'js_challenge', 'managed_challenge', 'log', 'allow', 'bypass');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."waf_status" AS ENUM('active', 'inactive', 'paused', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dns_record_type" AS ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS', 'CAA', 'DS', 'SSHFP', 'TLSA', 'HTTPS', 'SVCB');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."load_balancing_status" AS ENUM('active', 'inactive', 'degraded', 'healthy', 'unhealthy');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"password_hash" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deployment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deployment_id" uuid NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"git_repository" text,
	"git_branch" text DEFAULT 'main',
	"build_command" text DEFAULT 'npm run build',
	"output_directory" text DEFAULT '.next',
	"install_command" text DEFAULT 'npm ci',
	"environment" jsonb DEFAULT '{}'::jsonb,
	"framework" text DEFAULT 'nextjs' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"domain" text,
	"container_port" integer DEFAULT 3000,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "databases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'postgresql' NOT NULL,
	"version" text DEFAULT '16',
	"status" text DEFAULT 'creating' NOT NULL,
	"host" text,
	"port" integer DEFAULT 5432,
	"database_name" text,
	"username" text,
	"password" text,
	"public_access" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"error" text,
	"output" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"nodes" jsonb DEFAULT '[]'::jsonb,
	"connections" jsonb DEFAULT '{}'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'inactive' NOT NULL,
	"webhook_url" text,
	"error_count" text DEFAULT '0',
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wordpress_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"status" text DEFAULT 'installing' NOT NULL,
	"php_version" text DEFAULT '8.2',
	"wp_version" text DEFAULT 'latest',
	"admin_user" text,
	"admin_password" text,
	"admin_email" text,
	"container_port" integer DEFAULT 8080,
	"resource_limits" text,
	"ssl_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dns_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"ttl" text DEFAULT '3600',
	"priority" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"verified" boolean DEFAULT false,
	"ssl_enabled" boolean DEFAULT false,
	"dns_records" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domains_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"domain_id" uuid,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"quota" integer DEFAULT 1024,
	"forward_to" text,
	"autoresponder" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buckets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket_id" uuid NOT NULL,
	"name" text NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"mime_type" text DEFAULT 'application/octet-stream',
	"path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edge_function_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"function_id" uuid NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edge_functions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"source_code" text DEFAULT 'export default async (req: Request) => {
  return new Response("Hello from Edge!");
}',
	"runtime" text DEFAULT 'deno' NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"url" text,
	"environment" jsonb DEFAULT '{}'::jsonb,
	"memory" text DEFAULT '256',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "edge_functions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backup_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"database_id" uuid NOT NULL,
	"frequency" text DEFAULT 'daily' NOT NULL,
	"retention" integer DEFAULT 7,
	"time" text DEFAULT '02:00',
	"enabled" text DEFAULT 'true',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"database_id" uuid,
	"project_id" uuid,
	"name" text NOT NULL,
	"type" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"size" integer DEFAULT 0,
	"file_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rls_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"database_id" uuid NOT NULL,
	"table_name" text NOT NULL,
	"name" text NOT NULL,
	"definition" text NOT NULL,
	"policy_type" text DEFAULT 'all' NOT NULL,
	"role" text DEFAULT 'authenticated',
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "realtime_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"event" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "realtime_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"database_id" uuid NOT NULL,
	"name" text NOT NULL,
	"table_name" text NOT NULL,
	"event" text DEFAULT '*' NOT NULL,
	"filter" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "database_extensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"database_id" uuid NOT NULL,
	"name" text NOT NULL,
	"version" text,
	"enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"client_id" text,
	"client_secret" text,
	"redirect_url" text,
	"additional_config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_logins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"email" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preview_deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deployment_id" uuid NOT NULL,
	"branch_name" text NOT NULL,
	"commit_sha" text,
	"commit_message" text,
	"preview_url" text,
	"status" text DEFAULT 'building' NOT NULL,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "database_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"database_id" uuid NOT NULL,
	"name" text NOT NULL,
	"table_name" text NOT NULL,
	"events" text DEFAULT '*' NOT NULL,
	"url" text NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"event_triggered" text NOT NULL,
	"status_code" text,
	"response_body" text,
	"success" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hosting_account_id" uuid NOT NULL,
	"command" text NOT NULL,
	"schedule" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_run_at" timestamp,
	"last_output" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ftp_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hosting_account_id" uuid NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"directory" text DEFAULT '/',
	"permissions" text DEFAULT 'read_write' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hosting_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"package" text DEFAULT 'free',
	"disk_quota" integer DEFAULT 1024,
	"disk_used" integer DEFAULT 0,
	"bandwidth_quota" integer DEFAULT 10240,
	"bandwidth_used" integer DEFAULT 0,
	"php_version" text DEFAULT '8.2',
	"server_ip" text,
	"nameservers" jsonb DEFAULT '["ns1.cloudhost.app","ns2.cloudhost.app"]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "php_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hosting_account_id" uuid NOT NULL,
	"version" text DEFAULT '8.2' NOT NULL,
	"memory_limit" text DEFAULT '256M',
	"max_upload_size" text DEFAULT '64M',
	"max_execution_time" text DEFAULT '120',
	"extensions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"hosting_account_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'installing' NOT NULL,
	"version" text NOT NULL,
	"admin_url" text,
	"admin_user" text,
	"admin_password" text,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"icon" text,
	"version" text NOT NULL,
	"framework" text NOT NULL,
	"install_type" text NOT NULL,
	"docker_image" text,
	"source_url" text,
	"default_port" integer DEFAULT 80,
	"env_vars" jsonb DEFAULT '[]'::jsonb,
	"requirements" jsonb DEFAULT '{}'::jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	"installs" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buildpack_detections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"framework" text NOT NULL,
	"language" text NOT NULL,
	"detect_files" jsonb NOT NULL,
	"build_command" text,
	"start_command" text,
	"default_port" integer,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "docker_deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"build_type" text NOT NULL,
	"source" text,
	"framework" text,
	"port" integer DEFAULT 3000,
	"env_vars" jsonb DEFAULT '{}'::jsonb,
	"volumes" jsonb DEFAULT '[]'::jsonb,
	"replicas" integer DEFAULT 1,
	"status" text DEFAULT 'deploying' NOT NULL,
	"url" text,
	"provider_id" text,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"resources" jsonb DEFAULT '{"cpu":"0.5","memory":"512M"}'::jsonb,
	"domain" text,
	"ssl_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cf_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"triggers" jsonb DEFAULT '[]'::jsonb,
	"status" "cf_workflow_status" DEFAULT 'paused',
	"runs" jsonb DEFAULT '[]'::jsonb,
	"run_history" jsonb DEFAULT '[]'::jsonb,
	"schedule" text,
	"concurrency" integer DEFAULT 1,
	"retries" jsonb DEFAULT '{"maxRetries":3,"backoff":"exponential"}'::jsonb,
	"timeout" integer DEFAULT 300,
	"env_vars" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloudflare_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"project_name" text NOT NULL,
	"domain" text,
	"custom_domains" jsonb DEFAULT '[]'::jsonb,
	"git_provider" text,
	"git_repo" text,
	"git_branch" text,
	"build_command" text DEFAULT 'npm run build',
	"build_output_dir" text DEFAULT 'dist',
	"root_dir" text DEFAULT '/',
	"env_vars" jsonb DEFAULT '{}'::jsonb,
	"compatibility_date" text,
	"compatibility_flags" jsonb DEFAULT '[]'::jsonb,
	"deployments" jsonb DEFAULT '[]'::jsonb,
	"deployment_history" jsonb DEFAULT '[]'::jsonb,
	"analytics" jsonb DEFAULT '{"visits":0,"bandwidth":0}'::jsonb,
	"status" text DEFAULT 'inactive',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"tag" text DEFAULT 'latest',
	"registry" text DEFAULT 'docker.io',
	"command" text,
	"args" jsonb DEFAULT '[]'::jsonb,
	"env_vars" jsonb DEFAULT '{}'::jsonb,
	"secrets" jsonb DEFAULT '{}'::jsonb,
	"ports" jsonb DEFAULT '[]'::jsonb,
	"volumes" jsonb DEFAULT '[]'::jsonb,
	"replicas" integer DEFAULT 1,
	"resources" jsonb DEFAULT '{"cpu":"0.5","memory":"512MB"}'::jsonb,
	"status" "container_status" DEFAULT 'stopped',
	"url" text,
	"region" text DEFAULT 'auto',
	"auto_scale" boolean DEFAULT false,
	"health_check" jsonb DEFAULT '{"path":"/health","interval":30}'::jsonb,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"cpu":0,"memory":0,"network":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "durable_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"worker_id" uuid,
	"name" text NOT NULL,
	"class_name" text NOT NULL,
	"status" "durable_object_status" DEFAULT 'active',
	"storage" jsonb DEFAULT '{}'::jsonb,
	"alarms" jsonb DEFAULT '[]'::jsonb,
	"migrations" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"dns_configured" boolean DEFAULT false,
	"forwarding_addresses" jsonb DEFAULT '[]'::jsonb,
	"catch_all_address" text,
	"custom_addresses" jsonb DEFAULT '[]'::jsonb,
	"send_config" jsonb DEFAULT '{"enabled":false,"senderName":"","apiKey":""}'::jsonb,
	"received_emails" jsonb DEFAULT '[]'::jsonb,
	"sent_emails" jsonb DEFAULT '[]'::jsonb,
	"routing_rules" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"received":0,"sent":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sandboxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"runtime" text DEFAULT 'node:18',
	"code" text DEFAULT 'console.log(''hello world'');',
	"status" "sandbox_status" DEFAULT 'stopped',
	"output" jsonb DEFAULT '[]'::jsonb,
	"resources" jsonb DEFAULT '{"cpu":"0.2","memory":"128MB","timeout":30}'::jsonb,
	"network" jsonb DEFAULT '{"internet":true,"allowedDomains":[]}'::jsonb,
	"files" jsonb DEFAULT '[]'::jsonb,
	"env_vars" jsonb DEFAULT '{}'::jsonb,
	"config" jsonb DEFAULT '{}'::jsonb,
	"execution_history" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "worker_observability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"traces" jsonb DEFAULT '[]'::jsonb,
	"metrics" jsonb DEFAULT '{"requests":0,"errors":0,"latency":{},"statusCodes":{}}'::jsonb,
	"alerts" jsonb DEFAULT '[]'::jsonb,
	"dashboards" jsonb DEFAULT '[]'::jsonb,
	"retention_days" integer DEFAULT 7,
	"sampling_rate" integer DEFAULT 100,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"script" text DEFAULT 'export default { async fetch(request, env, ctx) { return new Response(''Hello World!''); } }',
	"runtime" "worker_runtime" DEFAULT 'javascript',
	"status" "worker_status" DEFAULT 'inactive',
	"url" text,
	"routes" jsonb DEFAULT '[]'::jsonb,
	"triggers" jsonb DEFAULT '[]'::jsonb,
	"env_vars" jsonb DEFAULT '{}'::jsonb,
	"secrets" jsonb DEFAULT '{}'::jsonb,
	"compatibility_date" text DEFAULT '2024-01-01',
	"compatibility_flags" jsonb DEFAULT '[]'::jsonb,
	"tail_consumers" jsonb DEFAULT '[]'::jsonb,
	"observability" jsonb DEFAULT '{"logs":false,"metrics":false,"traces":false}'::jsonb,
	"migrations" jsonb DEFAULT '[]'::jsonb,
	"deployment_id" text,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"requests":0,"duration":0,"cpuTime":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workers_for_platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"namespace" text NOT NULL,
	"description" text,
	"dispatch_workers" jsonb DEFAULT '[]'::jsonb,
	"smart_placement" boolean DEFAULT true,
	"bindings" jsonb DEFAULT '{"kv":[],"r2":[],"d1":[],"queues":[],"services":[]}'::jsonb,
	"limits" jsonb DEFAULT '{"cpuTime":"10ms","memory":"128MB","requestsPerMinute":1000}'::jsonb,
	"analytics" jsonb DEFAULT '{"totalWorkers":0,"activeWorkers":0,"totalRequests":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workers_for_platforms_namespace_unique" UNIQUE("namespace")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"store" jsonb DEFAULT '{"type":"r2","bucket":"","prefix":""}'::jsonb,
	"versions" jsonb DEFAULT '[]'::jsonb,
	"retention_policy" jsonb DEFAULT '{"maxVersions":10,"daysToLive":90}'::jsonb,
	"access_control" jsonb DEFAULT '{"public":false,"allowedUsers":[]}'::jsonb,
	"usage" jsonb DEFAULT '{"totalVersions":0,"totalSize":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cache_reserve" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"zone" text NOT NULL,
	"enabled" boolean DEFAULT false,
	"tiered_cache" boolean DEFAULT false,
	"cache_rules" jsonb DEFAULT '[]'::jsonb,
	"purge_history" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"cachedBytes":0,"bandwidthSaved":0,"hitRate":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "d1_databases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"status" "d1_status" DEFAULT 'active',
	"version" text DEFAULT '1.0',
	"region" text DEFAULT 'auto',
	"queries" jsonb DEFAULT '[]'::jsonb,
	"migrations" jsonb DEFAULT '[]'::jsonb,
	"tables" jsonb DEFAULT '[]'::jsonb,
	"bindings" jsonb DEFAULT '[]'::jsonb,
	"backup_schedule" text,
	"backups" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"reads":0,"writes":0,"storage":0,"rows":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_platform" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"source" jsonb DEFAULT '{"type":"r2","bucket":"","prefix":""}'::jsonb,
	"schema" jsonb DEFAULT '{"fields":[],"partitions":[]}'::jsonb,
	"pipelines" jsonb DEFAULT '[]'::jsonb,
	"transforms" jsonb DEFAULT '[]'::jsonb,
	"catalog" jsonb DEFAULT '{"tables":[],"views":[],"materializedViews":[]}'::jsonb,
	"queries" jsonb DEFAULT '[]'::jsonb,
	"schedules" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"ingested":0,"queried":0,"storage":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hyperdrive_databases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"connection_string" text,
	"origin_host" text,
	"origin_port" integer DEFAULT 5432,
	"origin_database" text,
	"origin_user" text,
	"cached_connections" integer DEFAULT 50,
	"max_age" integer DEFAULT 300,
	"status" "hyperdrive_status" DEFAULT 'disconnected',
	"pool_size" integer DEFAULT 10,
	"latency" jsonb DEFAULT '{"average":0,"p50":0,"p95":0,"p99":0}'::jsonb,
	"queries" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"queries":0,"cacheHits":0,"cacheMisses":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kv_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"namespace_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"expiration_ttl" integer,
	"expiration" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kv_namespaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"title" text NOT NULL,
	"provider_id" text,
	"description" text,
	"keys" jsonb DEFAULT '[]'::jsonb,
	"key_count" integer DEFAULT 0,
	"total_size" integer DEFAULT 0,
	"bindings" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"usage" jsonb DEFAULT '{"reads":0,"writes":0,"deletes":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"type" "queue_type" DEFAULT 'standard',
	"consumers" jsonb DEFAULT '[]'::jsonb,
	"producers" jsonb DEFAULT '[]'::jsonb,
	"messages" jsonb DEFAULT '[]'::jsonb,
	"message_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"max_concurrency" integer DEFAULT 10,
	"retention_period" integer DEFAULT 86400,
	"delivery_delay" integer DEFAULT 0,
	"usage" jsonb DEFAULT '{"published":0,"delivered":0,"acknowledged":0,"retried":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "r2_buckets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"description" text,
	"visibility" "bucket_visibility" DEFAULT 'private',
	"region" text DEFAULT 'auto',
	"objects" jsonb DEFAULT '[]'::jsonb,
	"object_count" integer DEFAULT 0,
	"total_size" integer DEFAULT 0,
	"lifecycle_rules" jsonb DEFAULT '[]'::jsonb,
	"cors_rules" jsonb DEFAULT '[]'::jsonb,
	"custom_domains" jsonb DEFAULT '[]'::jsonb,
	"r2_policies" jsonb DEFAULT '[]'::jsonb,
	"public_url" text,
	"usage" jsonb DEFAULT '{"requests":0,"bandwidth":0,"storage":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "r2_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket_id" uuid NOT NULL,
	"key" text NOT NULL,
	"size" integer NOT NULL,
	"content_type" text,
	"etag" text,
	"storage_class" text DEFAULT 'standard',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"versions" jsonb DEFAULT '[]'::jsonb,
	"is_public" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"model" text DEFAULT '@cf/meta/llama-3.1-8b-instruct',
	"system_prompt" text DEFAULT 'You are a helpful AI assistant.',
	"tools" jsonb DEFAULT '[]'::jsonb,
	"knowledge" jsonb DEFAULT '{"sources":[],"vectorIndexId":""}'::jsonb,
	"memory" jsonb DEFAULT '{"type":"conversation","maxMessages":50}'::jsonb,
	"status" "agent_status" DEFAULT 'idle',
	"sessions" jsonb DEFAULT '[]'::jsonb,
	"runs" jsonb DEFAULT '[]'::jsonb,
	"config" jsonb DEFAULT '{"maxTokens":2048,"temperature":0.7,"topP":0.9}'::jsonb,
	"webhook_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_gateway" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider" text DEFAULT 'openai',
	"endpoint" text,
	"api_key" text,
	"status" "ai_gateway_status" DEFAULT 'active',
	"cache_config" jsonb DEFAULT '{"enabled":true,"ttl":3600}'::jsonb,
	"rate_limits" jsonb DEFAULT '{"requestsPerMinute":60,"tokensPerMinute":60000}'::jsonb,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"analytics" jsonb DEFAULT '{"totalRequests":0,"cachedResponses":0,"tokensSaved":0,"costSaved":0}'::jsonb,
	"fallback_providers" jsonb DEFAULT '[]'::jsonb,
	"provider_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"provider" text DEFAULT 'cloudflare',
	"category" text NOT NULL,
	"description" text,
	"status" "ai_model_status" DEFAULT 'available',
	"max_tokens" integer DEFAULT 8192,
	"pricing" jsonb DEFAULT '{"perRequest":0,"perToken":0}'::jsonb,
	"capabilities" jsonb DEFAULT '[]'::jsonb,
	"supported_languages" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_search" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"indexes" jsonb DEFAULT '[]'::jsonb,
	"documents" jsonb DEFAULT '[]'::jsonb,
	"search_history" jsonb DEFAULT '[]'::jsonb,
	"config" jsonb DEFAULT '{"chunkSize":512,"chunkOverlap":64,"embeddingModel":"@cf/baai/bge-base-en-v1.5"}'::jsonb,
	"provider_id" text,
	"usage" jsonb DEFAULT '{"searches":0,"documentsIndexed":0,"storage":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vectorize_indexes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"dimensions" integer DEFAULT 768,
	"metric" text DEFAULT 'cosine',
	"vectors" jsonb DEFAULT '[]'::jsonb,
	"vector_count" integer DEFAULT 0,
	"provider_id" text,
	"config" jsonb DEFAULT '{"similarity":"cosine","quantization":"fp32"}'::jsonb,
	"usage" jsonb DEFAULT '{"queries":0,"vectorsInserted":0,"storage":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workers_ai" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"models" jsonb DEFAULT '[]'::jsonb,
	"favorite_models" jsonb DEFAULT '[]'::jsonb,
	"custom_models" jsonb DEFAULT '[]'::jsonb,
	"inference_history" jsonb DEFAULT '[]'::jsonb,
	"batch_jobs" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"totalRequests":0,"totalTokens":0,"totalCost":0}'::jsonb,
	"rate_limits" jsonb DEFAULT '{"requestsPerMinute":100,"tokensPerMinute":100000}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"filename" text,
	"content_type" text,
	"size" integer,
	"width" integer,
	"height" integer,
	"variants" jsonb DEFAULT '[]'::jsonb,
	"variant_configs" jsonb DEFAULT '[]'::jsonb,
	"transformations" jsonb DEFAULT '[]'::jsonb,
	"blurhash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"delivery_urls" jsonb DEFAULT '{}'::jsonb,
	"usage" jsonb DEFAULT '{"requests":0,"bandwidth":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "realtime_kit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"app_type" text DEFAULT 'messaging',
	"tokens" jsonb DEFAULT '[]'::jsonb,
	"connections" jsonb DEFAULT '[]'::jsonb,
	"connection_count" integer DEFAULT 0,
	"max_connections" integer DEFAULT 100,
	"allowed_origins" jsonb DEFAULT '[]'::jsonb,
	"webhook_url" text,
	"turn_config" jsonb DEFAULT '{"servers":[],"username":"","credential":""}'::jsonb,
	"sfu_config" jsonb DEFAULT '{"enabled":false,"maxPublishers":10,"maxSubscribers":100}'::jsonb,
	"usage" jsonb DEFAULT '{"connections":0,"messages":0,"bandwidth":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"filename" text,
	"duration" integer,
	"size" integer,
	"status" text DEFAULT 'processing',
	"input_type" text DEFAULT 'video',
	"playback_url" text,
	"preview_url" text,
	"thumbnail_url" text,
	"ready_to_stream" boolean DEFAULT false,
	"allowed_origins" jsonb DEFAULT '[]'::jsonb,
	"require_signed_urls" boolean DEFAULT false,
	"signed_secret" text,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"subtitles" jsonb DEFAULT '[]'::jsonb,
	"chapters" jsonb DEFAULT '[]'::jsonb,
	"live_input" jsonb DEFAULT '{}'::jsonb,
	"recording" jsonb DEFAULT '{"mode":"automatic","timeoutSeconds":0}'::jsonb,
	"watermark" jsonb DEFAULT '{}'::jsonb,
	"usage" jsonb DEFAULT '{"views":0,"watchTime":0,"bandwidth":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_side_security" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"policies" jsonb DEFAULT '[]'::jsonb,
	"scripts" jsonb DEFAULT '[]'::jsonb,
	"alerts" jsonb DEFAULT '[]'::jsonb,
	"reports" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ddos_protection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"mode" text DEFAULT 'automatic',
	"rules" jsonb DEFAULT '[]'::jsonb,
	"thresholds" jsonb DEFAULT '{"requestsPerSecond":1000,"burstSize":2000}'::jsonb,
	"alerts" jsonb DEFAULT '{"email":true,"webhook":false}'::jsonb,
	"traffic_anomalies" jsonb DEFAULT '[]'::jsonb,
	"mitigation_history" jsonb DEFAULT '[]'::jsonb,
	"attack_logs" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "magic_transit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"provider_id" text,
	"tunnels" jsonb DEFAULT '[]'::jsonb,
	"routes" jsonb DEFAULT '[]'::jsonb,
	"gre_tunnels" jsonb DEFAULT '[]'::jsonb,
	"ipsec_tunnels" jsonb DEFAULT '[]'::jsonb,
	"static_routes" jsonb DEFAULT '[]'::jsonb,
	"health_checks" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "network_firewall" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"provider_id" text,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"lists" jsonb DEFAULT '[]'::jsonb,
	"ip_lists" jsonb DEFAULT '[]'::jsonb,
	"geo_rules" jsonb DEFAULT '[]'::jsonb,
	"packet_filters" jsonb DEFAULT '[]'::jsonb,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rate_limiting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"description" text,
	"thresholds" jsonb DEFAULT '{"requestsPerPeriod":100,"period":60}'::jsonb,
	"action" text DEFAULT 'block',
	"expression" text DEFAULT 'true',
	"counting_expression" text,
	"mitigation_timeout" integer DEFAULT 60,
	"status" text DEFAULT 'active',
	"hits" integer DEFAULT 0,
	"blocked" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssl_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"hostname" text NOT NULL,
	"provider_id" text,
	"type" "ssl_type" DEFAULT 'universal',
	"status" text DEFAULT 'pending',
	"issuer" text,
	"signature" text,
	"serial_number" text,
	"fingerprint" text,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"keyless_server" jsonb DEFAULT '{}'::jsonb,
	"custom_certificate" text,
	"private_key" text,
	"bundle_method" text DEFAULT 'compatible',
	"geo_restrictions" jsonb DEFAULT '{}'::jsonb,
	"settings" jsonb DEFAULT '{"alwaysUseHttps":true,"minTlsVersion":"1.2"}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "turnstile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"domain" text NOT NULL,
	"site_key" text NOT NULL,
	"secret_key" text NOT NULL,
	"mode" text DEFAULT 'invisible',
	"status" text DEFAULT 'active',
	"settings" jsonb DEFAULT '{"preClearance":false,"verifyOnIdle":false}'::jsonb,
	"analytics" jsonb DEFAULT '{"totalPassed":0,"totalFailed":0,"totalChallenges":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waf_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"action" "waf_action" DEFAULT 'block',
	"status" "waf_status" DEFAULT 'active',
	"expression" text DEFAULT 'true',
	"priority" integer DEFAULT 1,
	"group" text DEFAULT 'custom',
	"ref" text,
	"provider_id" text,
	"logging" jsonb DEFAULT '{"enabled":true}'::jsonb,
	"ruleset" text,
	"category" text,
	"hits" integer DEFAULT 0,
	"last_hit" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_shield" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"zone" text NOT NULL,
	"endpoints" jsonb DEFAULT '[]'::jsonb,
	"schema_validation" boolean DEFAULT false,
	"schema" jsonb DEFAULT '{}'::jsonb,
	"mtls_rules" jsonb DEFAULT '[]'::jsonb,
	"sensitive_data_detection" boolean DEFAULT true,
	"anomaly_detection" boolean DEFAULT true,
	"usage" jsonb DEFAULT '{"totalEndpoints":0,"requests":0,"blockedRequests":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_management" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"zone" text NOT NULL,
	"mode" text DEFAULT 'javascript_detection',
	"rules" jsonb DEFAULT '[]'::jsonb,
	"bot_scores" jsonb DEFAULT '[]'::jsonb,
	"analytics" jsonb DEFAULT '{"totalRequests":0,"automatedRequests":0,"verifiedBots":0}'::jsonb,
	"custom_rulesets" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cdn_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"zone" text NOT NULL,
	"caching_rules" jsonb DEFAULT '[]'::jsonb,
	"cache_level" text DEFAULT 'standard',
	"edge_cache_ttl" integer DEFAULT 86400,
	"browser_cache_ttl" integer DEFAULT 14400,
	"purge_history" jsonb DEFAULT '[]'::jsonb,
	"cache_keys" jsonb DEFAULT '{"enabled":true,"includeHost":true,"includeScheme":true}'::jsonb,
	"preload_urls" jsonb DEFAULT '[]'::jsonb,
	"argo_enabled" boolean DEFAULT false,
	"argo_smart_routing" boolean DEFAULT false,
	"tiered_caching" boolean DEFAULT false,
	"usage" jsonb DEFAULT '{"cachedBytes":0,"bandwidthSaved":0,"hitRate":0,"requests":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cf_dns_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_id" uuid NOT NULL,
	"type" "dns_record_type" NOT NULL,
	"name" text NOT NULL,
	"provider_id" text,
	"content" text NOT NULL,
	"ttl" integer DEFAULT 120,
	"priority" integer,
	"proxied" boolean DEFAULT false,
	"proxiable" boolean DEFAULT true,
	"comment" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_on" timestamp DEFAULT now(),
	"modified_on" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dns_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"status" text DEFAULT 'active',
	"paused" boolean DEFAULT false,
	"type" text DEFAULT 'full',
	"name_servers" jsonb DEFAULT '[]'::jsonb,
	"original_name_servers" jsonb DEFAULT '[]'::jsonb,
	"verification_key" text,
	"records" jsonb DEFAULT '[]'::jsonb,
	"record_count" integer DEFAULT 0,
	"analytics" jsonb DEFAULT '{"dnsQueries":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_routing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"domain" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"catch_all" text,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"addresses" jsonb DEFAULT '[]'::jsonb,
	"dns_records" jsonb DEFAULT '[]'::jsonb,
	"analytics" jsonb DEFAULT '{"totalReceived":0,"totalForwarded":0,"totalRejected":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "load_balancers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"hostname" text NOT NULL,
	"pools" jsonb DEFAULT '[]'::jsonb,
	"monitors" jsonb DEFAULT '[]'::jsonb,
	"steering_policy" text DEFAULT 'geo',
	"session_affinity" text DEFAULT 'none',
	"ttl" integer DEFAULT 30,
	"proxied" boolean DEFAULT true,
	"status" "load_balancing_status" DEFAULT 'active',
	"health_checks" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"requests":0,"failovers":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "log_explorer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"dataset" text DEFAULT 'http_requests',
	"queries" jsonb DEFAULT '[]'::jsonb,
	"saved_queries" jsonb DEFAULT '[]'::jsonb,
	"dashboards" jsonb DEFAULT '[]'::jsonb,
	"retention_days" integer DEFAULT 7,
	"sampling" integer DEFAULT 100,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "network_interconnect" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'private',
	"facility" text,
	"vlan" integer,
	"ip_address" text,
	"bgp_config" jsonb DEFAULT '{"localAsn":0,"peerAsn":0,"multihop":false}'::jsonb,
	"bandwidth" integer DEFAULT 1000,
	"description" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spectrum_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"protocol" text DEFAULT 'tcp',
	"origin_dns" text,
	"origin_port" integer DEFAULT 80,
	"proxy_ports" jsonb DEFAULT '[]'::jsonb,
	"ip_firewall" boolean DEFAULT true,
	"proxy_protocol" text DEFAULT 'off',
	"tls" text DEFAULT 'off',
	"traffic_type" text DEFAULT 'direct',
	"edge_ips" jsonb DEFAULT '{"type":"dynamic"}'::jsonb,
	"dns" jsonb DEFAULT '{"type":"CNAME","name":""}'::jsonb,
	"usage" jsonb DEFAULT '{"bandwidth":0,"connections":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waiting_room" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"provider_id" text,
	"hostname" text NOT NULL,
	"path" text DEFAULT '/',
	"total_active_users" integer DEFAULT 200,
	"new_user_per_minute" integer DEFAULT 10,
	"queueing_method" text DEFAULT 'fifo',
	"session_duration" integer DEFAULT 5,
	"session_renewal_enabled" boolean DEFAULT true,
	"cookie_suffix" text,
	"custom_page_html" text,
	"default_template_language" text DEFAULT 'en-US',
	"json_response_enabled" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"analytics" jsonb DEFAULT '{"totalUsers":0,"queuedUsers":0,"waitedUsers":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "browser_isolation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"policies" jsonb DEFAULT '[]'::jsonb,
	"allowed_urls" jsonb DEFAULT '[]'::jsonb,
	"blocked_urls" jsonb DEFAULT '[]'::jsonb,
	"clipboard_control" text DEFAULT 'read_write',
	"file_upload" text DEFAULT 'allow',
	"file_download" text DEFAULT 'allow',
	"keyboard_control" boolean DEFAULT true,
	"printer_control" boolean DEFAULT false,
	"provider_id" text,
	"status" text DEFAULT 'active',
	"analytics" jsonb DEFAULT '{"totalSessions":0,"activeSessions":0,"bandwidth":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "casb" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"integrations" jsonb DEFAULT '[]'::jsonb,
	"findings" jsonb DEFAULT '[]'::jsonb,
	"severity_counts" jsonb DEFAULT '{"critical":0,"high":0,"medium":0,"low":0}'::jsonb,
	"auto_remediation" boolean DEFAULT false,
	"schedules" jsonb DEFAULT '[]'::jsonb,
	"provider_id" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_loss_prevention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"profiles" jsonb DEFAULT '[]'::jsonb,
	"entries" jsonb DEFAULT '[]'::jsonb,
	"matched_entries" jsonb DEFAULT '[]'::jsonb,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"provider_id" text,
	"status" text DEFAULT 'active',
	"analytics" jsonb DEFAULT '{"totalMatches":0,"blocked":0,"allowed":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_security" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"domain" text NOT NULL,
	"quarantine" jsonb DEFAULT '[]'::jsonb,
	"settings" jsonb DEFAULT '{"spamLevel":"standard","malwareProtection":true,"phishingProtection":true}'::jsonb,
	"dmarc" text DEFAULT 'none',
	"spf" text,
	"dkim" text,
	"provider_id" text,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"analytics" jsonb DEFAULT '{"totalEmails":0,"blocked":0,"quarantined":0,"delivered":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "magic_mesh" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"network" text NOT NULL,
	"connectors" jsonb DEFAULT '[]'::jsonb,
	"tunnels" jsonb DEFAULT '[]'::jsonb,
	"routes" jsonb DEFAULT '[]'::jsonb,
	"virtual_networks" jsonb DEFAULT '[]'::jsonb,
	"devices" jsonb DEFAULT '[]'::jsonb,
	"provider_id" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "magic_wan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"connectors" jsonb DEFAULT '[]'::jsonb,
	"tunnels" jsonb DEFAULT '[]'::jsonb,
	"ipsec_tunnels" jsonb DEFAULT '[]'::jsonb,
	"gre_tunnels" jsonb DEFAULT '[]'::jsonb,
	"routes" jsonb DEFAULT '[]'::jsonb,
	"static_routes" jsonb DEFAULT '[]'::jsonb,
	"health_checks" jsonb DEFAULT '[]'::jsonb,
	"provider_id" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "secure_web_gateway" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"policies" jsonb DEFAULT '[]'::jsonb,
	"categories" jsonb DEFAULT '[]'::jsonb,
	"url_categories" jsonb DEFAULT '[]'::jsonb,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"lists" jsonb DEFAULT '[]'::jsonb,
	"provider_id" text,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"analytics" jsonb DEFAULT '{"totalRequests":0,"blocked":0,"allowed":0}'::jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zero_trust_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"session_duration" text DEFAULT '24h',
	"policies" jsonb DEFAULT '[]'::jsonb,
	"applications" jsonb DEFAULT '[]'::jsonb,
	"groups" jsonb DEFAULT '[]'::jsonb,
	"service_tokens" jsonb DEFAULT '[]'::jsonb,
	"ssh_config" jsonb DEFAULT '{"enabled":false,"bastionHost":""}'::jsonb,
	"provider_id" text,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"usage" jsonb DEFAULT '{"totalUsers":0,"activeSessions":0,"totalRequests":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domain_marketplace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"listing_type" text DEFAULT 'fixed' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'active' NOT NULL,
	"category" text,
	"description" text,
	"views" integer DEFAULT 0,
	"watchers" integer DEFAULT 0,
	"make_offer" boolean DEFAULT false,
	"min_offer" numeric(10, 2),
	"listed_at" timestamp DEFAULT now(),
	"sold_at" timestamp,
	"buyer_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domain_privacy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain_id" uuid,
	"domain" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"privacy_type" text DEFAULT 'whois' NOT NULL,
	"masked_email" text,
	"masked_phone" text,
	"auto_renew" boolean DEFAULT true,
	"price" numeric(10, 2),
	"enabled_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domain_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"auth_code" text,
	"transfer_lock" boolean DEFAULT true,
	"privacy_enabled" boolean DEFAULT true,
	"years" integer DEFAULT 1,
	"price" numeric(10, 2),
	"initiated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domain_vault" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"vault_level" text DEFAULT 'standard' NOT NULL,
	"transfer_lock" boolean DEFAULT true,
	"delete_lock" boolean DEFAULT true,
	"update_lock" boolean DEFAULT true,
	"auth_code_protection" boolean DEFAULT true,
	"approvals_required" integer DEFAULT 1,
	"trusted_contacts" jsonb,
	"unlock_requested_at" timestamp,
	"unlock_approved_at" timestamp,
	"unlock_reason" text,
	"locked_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "free_dns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"nameservers" text[],
	"record_count" integer DEFAULT 0,
	"query_limit" integer DEFAULT 500000,
	"query_usage" integer DEFAULT 0,
	"activated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "handshake_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"blockchain_tx" text,
	"registration_period" integer DEFAULT 1,
	"price" numeric(10, 2),
	"nameserver" text,
	"wallet_address" text,
	"signature" text,
	"expires_at" timestamp,
	"registered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "premium_dns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"plan" text DEFAULT 'basic' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"dnssec" boolean DEFAULT false,
	"ddos_protection" boolean DEFAULT false,
	"analytics" boolean DEFAULT false,
	"geo_dns" boolean DEFAULT false,
	"template_management" boolean DEFAULT false,
	"record_count" integer DEFAULT 0,
	"query_count" integer DEFAULT 0,
	"price" numeric(10, 2),
	"activated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tld_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tld" text NOT NULL,
	"category" text,
	"description" text,
	"registration_price" numeric(10, 2) NOT NULL,
	"renewal_price" numeric(10, 2) NOT NULL,
	"transfer_price" numeric(10, 2),
	"is_new" boolean DEFAULT false,
	"is_promo" boolean DEFAULT false,
	"promo_price" numeric(10, 2),
	"min_years" integer DEFAULT 1,
	"max_years" integer DEFAULT 10,
	"requires_dnssec" boolean DEFAULT false,
	"requires_auth_code" boolean DEFAULT true,
	"popular" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tld_catalog_tld_unique" UNIQUE("tld")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whois_lookups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"registrar" text,
	"creation_date" timestamp,
	"expiry_date" timestamp,
	"name_servers" text[],
	"registrant_name" text,
	"registrant_org" text,
	"registrant_email" text,
	"registrant_country" text,
	"admin_name" text,
	"admin_email" text,
	"tech_name" text,
	"tech_email" text,
	"dnssec" boolean DEFAULT false,
	"status" text[],
	"raw_data" jsonb,
	"looked_up_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anti_spam_protection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"spam_score" integer DEFAULT 0,
	"emails_blocked" integer DEFAULT 0,
	"emails_quarantined" integer DEFAULT 0,
	"emails_allowed" integer DEFAULT 0,
	"rules" jsonb,
	"whitelist" text[],
	"blacklist" text[],
	"dkim_enabled" boolean DEFAULT false,
	"spf_enabled" boolean DEFAULT false,
	"dmarc_enabled" boolean DEFAULT false,
	"quarantine_spam" boolean DEFAULT true,
	"block_malware" boolean DEFAULT true,
	"block_phishing" boolean DEFAULT true,
	"price" numeric(10, 2),
	"activated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyber_insurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"coverage" text,
	"coverage_amount" numeric(12, 2),
	"deductible" numeric(10, 2),
	"premium" numeric(10, 2),
	"payment_frequency" text DEFAULT 'monthly',
	"start_date" timestamp,
	"end_date" timestamp,
	"auto_renew" boolean DEFAULT true,
	"policy_number" text,
	"insured_assets" jsonb,
	"coverage_types" jsonb,
	"claims_count" integer DEFAULT 0,
	"total_claimed" numeric(12, 2),
	"risk_level" text DEFAULT 'medium',
	"industry" text,
	"company_size" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dedicated_server_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cpu" text NOT NULL,
	"cpu_cores" integer NOT NULL,
	"ram" text NOT NULL,
	"ram_gb" integer NOT NULL,
	"storage" text NOT NULL,
	"storage_gb" integer NOT NULL,
	"storage_type" text DEFAULT 'NVMe SSD',
	"bandwidth" text,
	"bandwidth_tb" integer,
	"ip_count" integer DEFAULT 1,
	"location" text,
	"price" numeric(10, 2) NOT NULL,
	"setup_fee" numeric(10, 2) DEFAULT '0',
	"managed_price" numeric(10, 2),
	"in_stock" boolean DEFAULT true,
	"popular" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dedicated_servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"plan" text NOT NULL,
	"cpu" text NOT NULL,
	"ram" text NOT NULL,
	"storage" text NOT NULL,
	"bandwidth" text,
	"ip_count" integer DEFAULT 1,
	"ips" text[],
	"os" text,
	"location" text,
	"provider" text,
	"status" text DEFAULT 'provisioning' NOT NULL,
	"price" numeric(10, 2),
	"managed" boolean DEFAULT false,
	"auto_renew" boolean DEFAULT true,
	"provisioned_at" timestamp,
	"expires_at" timestamp,
	"last_rebooted_at" timestamp,
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fast_vpn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" text DEFAULT 'basic' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"protocol" text DEFAULT 'wireguard',
	"server_location" text,
	"server_ip" text,
	"assigned_ip" text,
	"port" integer,
	"public_key" text,
	"private_key" text,
	"bandwidth_used" text DEFAULT '0 GB',
	"bandwidth_limit" text DEFAULT '100 GB',
	"connected_devices" integer DEFAULT 0,
	"max_devices" integer DEFAULT 5,
	"kill_switch" boolean DEFAULT false,
	"split_tunneling" boolean DEFAULT false,
	"obfuscation" boolean DEFAULT false,
	"auto_connect" boolean DEFAULT false,
	"dns_leak_protection" boolean DEFAULT true,
	"price" numeric(10, 2),
	"activated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"last_connected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hacked_website_sos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'reported' NOT NULL,
	"description" text,
	"symptoms" jsonb,
	"malware_type" text,
	"infection_date" timestamp,
	"files_affected" integer DEFAULT 0,
	"files_cleaned" integer DEFAULT 0,
	"total_files" integer DEFAULT 0,
	"backup_restored" boolean DEFAULT false,
	"backup_date" timestamp,
	"security_patches" jsonb,
	"price" numeric(10, 2),
	"assigned_technician" text,
	"reported_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insurance_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'filed' NOT NULL,
	"incident_date" timestamp,
	"filed_at" timestamp DEFAULT now(),
	"description" text,
	"amount" numeric(12, 2),
	"approved_amount" numeric(12, 2),
	"evidence" jsonb,
	"notes" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public_dns_resolver" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"query_domain" text NOT NULL,
	"query_type" text DEFAULT 'A',
	"result" jsonb,
	"response_time" integer,
	"source_ip" text,
	"queried_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "security_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"security_id" uuid NOT NULL,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"path" text,
	"recommendation" text,
	"status" text DEFAULT 'open' NOT NULL,
	"auto_fixed" boolean DEFAULT false,
	"detected_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_migrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"source_url" text,
	"source_type" text,
	"target_url" text,
	"target_type" text DEFAULT 'cloudhost' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0,
	"files_transferred" integer DEFAULT 0,
	"total_files" integer DEFAULT 0,
	"data_size" text,
	"estimated_time" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_log" jsonb,
	"plugin" text,
	"preserve_settings" boolean DEFAULT true,
	"preserve_content" boolean DEFAULT true,
	"preserve_users" boolean DEFAULT true,
	"ssl_migration" boolean DEFAULT true,
	"incremental_sync" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vpn_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"country_code" text NOT NULL,
	"city" text,
	"server_count" integer DEFAULT 1,
	"latency" integer,
	"load" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "website_security" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"plan" text DEFAULT 'basic' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_scan" timestamp,
	"scan_frequency" text DEFAULT 'daily',
	"vulnerabilities" integer DEFAULT 0,
	"critical_count" integer DEFAULT 0,
	"high_count" integer DEFAULT 0,
	"medium_count" integer DEFAULT 0,
	"low_count" integer DEFAULT 0,
	"malware_detected" boolean DEFAULT false,
	"blacklisted" boolean DEFAULT false,
	"firewall" boolean DEFAULT false,
	"auto_fix" boolean DEFAULT false,
	"email_alerts" boolean DEFAULT true,
	"price" numeric(10, 2),
	"activated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abuse_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_name" text NOT NULL,
	"reporter_email" text NOT NULL,
	"report_type" text NOT NULL,
	"domain" text,
	"ip_address" text,
	"description" text NOT NULL,
	"evidence" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_to" uuid,
	"resolved_at" timestamp,
	"resolution" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "affiliate_referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"referred_email" text NOT NULL,
	"referred_user_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"commission" numeric(10, 2) DEFAULT '0',
	"order_amount" numeric(10, 2),
	"service_type" text,
	"signed_up_at" timestamp,
	"converted_at" timestamp,
	"commission_paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "affiliates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"referral_code" text NOT NULL,
	"commission_rate" numeric(5, 2) DEFAULT '10',
	"total_earned" numeric(12, 2) DEFAULT '0',
	"total_paid" numeric(12, 2) DEFAULT '0',
	"pending_balance" numeric(12, 2) DEFAULT '0',
	"referral_count" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2) DEFAULT '0',
	"payment_method" text,
	"payment_email" text,
	"promoted_services" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliates_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "affiliates_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_card_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"design" jsonb,
	"colors" jsonb,
	"fonts" jsonb,
	"front_url" text,
	"back_url" text,
	"format" text DEFAULT 'digital',
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_names" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"industry" text NOT NULL,
	"keywords" text[],
	"generated_names" jsonb,
	"saved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_starter_kits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kit_type" text NOT NULL,
	"business_name" text,
	"business_type" text,
	"llc_state" text,
	"llc_status" text DEFAULT 'pending',
	"ein_number" text,
	"ein_status" text DEFAULT 'pending',
	"operating_agreement" text,
	"bank_account_setup" boolean DEFAULT false,
	"domain_included" boolean DEFAULT true,
	"email_included" boolean DEFAULT true,
	"hosting_included" boolean DEFAULT true,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "font_maker_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"style" text,
	"glyphs" jsonb,
	"preview" text,
	"font_url" text,
	"formats" text[],
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledgebase_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"content" text,
	"excerpt" text,
	"author_id" uuid,
	"tags" text[],
	"views" integer DEFAULT 0,
	"helpful" integer DEFAULT 0,
	"not_helpful" integer DEFAULT 0,
	"is_video" boolean DEFAULT false,
	"video_url" text,
	"video_duration" text,
	"published" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledgebase_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logo_maker_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"brand_name" text NOT NULL,
	"industry" text,
	"style" text,
	"colors" jsonb,
	"fonts" jsonb,
	"svg_url" text,
	"png_url" text,
	"variants" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_purchase" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0,
	"applies_to" jsonb,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relate_ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"campaign_name" text NOT NULL,
	"platform" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"budget" numeric(10, 2),
	"spent" numeric(10, 2) DEFAULT '0',
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"ctr" numeric(5, 2),
	"target_audience" jsonb,
	"ad_content" jsonb,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relate_brand_monitoring" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"brand_name" text NOT NULL,
	"mentions" integer DEFAULT 0,
	"sentiment_score" numeric(3, 1),
	"top_sources" jsonb,
	"recent_mentions" jsonb,
	"competitors" jsonb,
	"alerts" jsonb,
	"last_scanned" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relate_local" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"category" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"phone" text,
	"website" text,
	"listings" jsonb,
	"listing_count" integer DEFAULT 0,
	"citation_count" integer DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"avg_rating" numeric(2, 1),
	"accuracy_score" integer DEFAULT 100,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relate_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"rating" numeric(2, 1),
	"review_count" integer DEFAULT 0,
	"total_rating" numeric(3, 1),
	"response_rate" integer DEFAULT 0,
	"avg_response_time" text,
	"sentiment" text,
	"recent_reviews" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relate_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"keywords" jsonb,
	"keyword_count" integer DEFAULT 0,
	"backlinks" integer DEFAULT 0,
	"domain_authority" integer DEFAULT 0,
	"page_authority" integer DEFAULT 0,
	"organic_traffic" integer DEFAULT 0,
	"crawl_errors" integer DEFAULT 0,
	"index_pages" integer DEFAULT 0,
	"competitors" jsonb,
	"recommendations" jsonb,
	"last_crawled" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relate_social" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"account_name" text,
	"posts" integer DEFAULT 0,
	"followers" integer DEFAULT 0,
	"following" integer DEFAULT 0,
	"engagement" numeric(5, 2) DEFAULT '0',
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"last_posted" timestamp,
	"connected" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_maker_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"template" text,
	"industry" text,
	"pages" jsonb,
	"theme" jsonb,
	"custom_domain" text,
	"published_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssl_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text DEFAULT 'Comodo' NOT NULL,
	"type" text NOT NULL,
	"validation" text NOT NULL,
	"domains" text DEFAULT '1' NOT NULL,
	"warranty" text,
	"encryption" text DEFAULT '256-bit',
	"issuance_time" text,
	"reissue_free" boolean DEFAULT true,
	"price" numeric(10, 2) NOT NULL,
	"regular_price" numeric(10, 2),
	"popular" boolean DEFAULT false,
	"features" jsonb,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"category" text,
	"priority" text DEFAULT 'normal',
	"status" text DEFAULT 'open' NOT NULL,
	"messages" jsonb,
	"assigned_to" uuid,
	"order_id" text,
	"related_service" text,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_promos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"promo_id" uuid,
	"code" text NOT NULL,
	"used_at" timestamp DEFAULT now(),
	"order_amount" numeric(10, 2),
	"discount_amount" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_ssl_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"catalog_id" uuid,
	"domain" text NOT NULL,
	"brand" text DEFAULT 'Comodo' NOT NULL,
	"type" text NOT NULL,
	"validation" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"csr" text,
	"certificate" text,
	"private_key" text,
	"ca_bundle" text,
	"expires_at" timestamp,
	"auto_renew" boolean DEFAULT true,
	"price" numeric(10, 2),
	"order_date" timestamp DEFAULT now(),
	"issued_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_directory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agency_name" text NOT NULL,
	"description" text,
	"website" text,
	"logo" text,
	"services" jsonb,
	"expertise" jsonb,
	"location" text,
	"client_count" integer DEFAULT 0,
	"project_count" integer DEFAULT 0,
	"avg_rating" numeric(2, 1),
	"verified" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_hosting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agency_name" text NOT NULL,
	"plan" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"client_count" integer DEFAULT 0,
	"max_clients" integer DEFAULT 10,
	"white_label" boolean DEFAULT false,
	"custom_branding" jsonb,
	"client_domains" jsonb,
	"revenue_share" numeric(5, 2) DEFAULT '20',
	"total_earned" numeric(12, 2) DEFAULT '0',
	"price" numeric(10, 2),
	"activated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_agent_deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_type" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'deploying' NOT NULL,
	"vps_id" uuid,
	"domain" text,
	"port" integer,
	"version" text DEFAULT 'latest',
	"docker_container_id" text,
	"api_endpoint" text,
	"api_key" text,
	"configuration" jsonb,
	"active_sessions" integer DEFAULT 0,
	"messages_processed" integer DEFAULT 0,
	"uptime" text,
	"price" numeric(10, 2),
	"deployed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_newsletter_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"subject" text,
	"topic" text,
	"tone" text DEFAULT 'professional',
	"content" text,
	"generated_content" text,
	"subscribers" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"open_rate" numeric(5, 2),
	"click_rate" numeric(5, 2),
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_hosting_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"plan" text NOT NULL,
	"cpu" text NOT NULL,
	"ram" text NOT NULL,
	"storage" text NOT NULL,
	"bandwidth" text,
	"location" text,
	"status" text DEFAULT 'provisioning' NOT NULL,
	"ip_address" text,
	"os" text,
	"managed" boolean DEFAULT false,
	"auto_scaled" boolean DEFAULT false,
	"price" numeric(10, 2),
	"provisioned_at" timestamp,
	"expires_at" timestamp,
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"author_name" text NOT NULL,
	"author_title" text,
	"author_avatar" text,
	"rating" integer NOT NULL,
	"content" text NOT NULL,
	"service_type" text,
	"featured" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"approved" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_builder_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"template" text,
	"industry" text,
	"products" integer DEFAULT 0,
	"orders" integer DEFAULT 0,
	"revenue" numeric(12, 2) DEFAULT '0',
	"payment_gateways" jsonb,
	"shipping_methods" jsonb,
	"tax_settings" jsonb,
	"custom_domain" text,
	"published_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "educational_partnerships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"institution_name" text NOT NULL,
	"institution_type" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"country" text,
	"student_count" integer,
	"program_type" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"discount_rate" numeric(5, 2),
	"discount_code" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "google_workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"plan" text DEFAULT 'business_starter' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"seats" integer DEFAULT 1,
	"storage_per_seat" text DEFAULT '30GB',
	"admin_email" text,
	"verified" boolean DEFAULT false,
	"mx_records" jsonb,
	"dns_status" text DEFAULT 'pending',
	"price" numeric(10, 2),
	"activated_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "horizons_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"prompt" text,
	"tech_stack" jsonb,
	"pages" jsonb,
	"features" jsonb,
	"integrations" jsonb,
	"custom_domain" text,
	"published_url" text,
	"ai_credits" integer DEFAULT 30,
	"ai_credits_used" integer DEFAULT 0,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hostinger_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"permissions" jsonb,
	"last_used" timestamp,
	"expires_at" timestamp,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hostinger_api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "link_in_bio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"username" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"theme" jsonb,
	"links" jsonb,
	"social_links" jsonb,
	"analytics" jsonb,
	"custom_domain" text,
	"published_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"views" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "link_in_bio_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "minecraft_servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"version" text DEFAULT 'latest',
	"server_type" text DEFAULT 'vanilla',
	"status" text DEFAULT 'provisioning' NOT NULL,
	"ram" text DEFAULT '2GB',
	"cpu" text DEFAULT '2 vCPU',
	"storage" text DEFAULT '20GB',
	"port" integer DEFAULT 25565,
	"ip_address" text,
	"max_players" integer DEFAULT 20,
	"online_players" integer DEFAULT 0,
	"world_size" text,
	"mods" jsonb,
	"plugins" jsonb,
	"whitelist" text[],
	"operators" text[],
	"online_mode" boolean DEFAULT true,
	"pvp" boolean DEFAULT true,
	"difficulty" text DEFAULT 'normal',
	"price" numeric(10, 2),
	"provisioned_at" timestamp,
	"last_started_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "n8n_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"version" text DEFAULT 'latest',
	"status" text DEFAULT 'deploying' NOT NULL,
	"vps_id" uuid,
	"domain" text,
	"port" integer DEFAULT 5678,
	"username" text,
	"password" text,
	"api_key" text,
	"active_workflows" integer DEFAULT 0,
	"total_workflows" integer DEFAULT 0,
	"executions_24h" integer DEFAULT 0,
	"docker_container_id" text,
	"deployed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "print_on_demand" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"store_name" text NOT NULL,
	"provider" text DEFAULT 'printful',
	"status" text DEFAULT 'active' NOT NULL,
	"products" integer DEFAULT 0,
	"orders" integer DEFAULT 0,
	"total_sales" numeric(12, 2) DEFAULT '0',
	"connected_platform" text,
	"api_key" text,
	"design_templates" jsonb,
	"mockup_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roadmap_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"priority" text DEFAULT 'medium',
	"votes" integer DEFAULT 0,
	"voters" jsonb,
	"eta" text,
	"launched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"severity" text DEFAULT 'info' NOT NULL,
	"description" text,
	"services" text[],
	"updates" jsonb,
	"started_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "website_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"preview_url" text,
	"thumbnail" text,
	"features" jsonb,
	"pages" jsonb,
	"industry" text,
	"is_responsive" boolean DEFAULT true,
	"is_ecommerce" boolean DEFAULT false,
	"is_ai" boolean DEFAULT false,
	"popularity" integer DEFAULT 0,
	"price" numeric(10, 2) DEFAULT '0',
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "website_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "woocommerce_hosting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"plan" text DEFAULT 'starter' NOT NULL,
	"status" text DEFAULT 'provisioning' NOT NULL,
	"store_name" text,
	"product_count" integer DEFAULT 0,
	"order_count" integer DEFAULT 0,
	"revenue" numeric(12, 2) DEFAULT '0',
	"woocommerce_version" text,
	"wp_version" text,
	"plugins" jsonb,
	"theme" text,
	"ssl_enabled" boolean DEFAULT true,
	"caching" text DEFAULT 'enabled',
	"cdn" boolean DEFAULT true,
	"price" numeric(10, 2),
	"provisioned_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"plan" text NOT NULL,
	"blueprint" text,
	"platform" text,
	"status" text DEFAULT 'provisioning' NOT NULL,
	"provider_id" text,
	"ip_address" text,
	"private_ip" text,
	"cpu" integer,
	"ram_mb" integer,
	"storage_gb" integer,
	"transfer_tb" integer,
	"price_monthly" integer,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"provisioned_at" timestamp,
	"terminated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "container_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"node_size" text NOT NULL,
	"node_count" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'provisioning' NOT NULL,
	"provider_id" text,
	"image" text,
	"ports" jsonb DEFAULT '[]'::jsonb,
	"env_vars" jsonb DEFAULT '{}'::jsonb,
	"auto_deploy" boolean DEFAULT true,
	"ip_address" text,
	"domain" text,
	"provisioned_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"plan_name" text NOT NULL,
	"provider" text NOT NULL,
	"provider_ref" text NOT NULL,
	"provider_cost_usd" numeric(10, 4) NOT NULL,
	"your_price_usd" numeric(10, 2) NOT NULL,
	"your_price_ngn" numeric(12, 2),
	"specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployment_logs" ADD CONSTRAINT "deployment_logs_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployments" ADD CONSTRAINT "deployments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "databases" ADD CONSTRAINT "databases_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflows" ADD CONSTRAINT "workflows_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wordpress_sites" ADD CONSTRAINT "wordpress_sites_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dns_records" ADD CONSTRAINT "dns_records_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "domains" ADD CONSTRAINT "domains_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buckets" ADD CONSTRAINT "buckets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storage_objects" ADD CONSTRAINT "storage_objects_bucket_id_buckets_id_fk" FOREIGN KEY ("bucket_id") REFERENCES "public"."buckets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edge_function_logs" ADD CONSTRAINT "edge_function_logs_function_id_edge_functions_id_fk" FOREIGN KEY ("function_id") REFERENCES "public"."edge_functions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edge_functions" ADD CONSTRAINT "edge_functions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backup_schedules" ADD CONSTRAINT "backup_schedules_database_id_databases_id_fk" FOREIGN KEY ("database_id") REFERENCES "public"."databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backups" ADD CONSTRAINT "backups_database_id_databases_id_fk" FOREIGN KEY ("database_id") REFERENCES "public"."databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backups" ADD CONSTRAINT "backups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credentials" ADD CONSTRAINT "credentials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rls_policies" ADD CONSTRAINT "rls_policies_database_id_databases_id_fk" FOREIGN KEY ("database_id") REFERENCES "public"."databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "realtime_messages" ADD CONSTRAINT "realtime_messages_subscription_id_realtime_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."realtime_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "realtime_subscriptions" ADD CONSTRAINT "realtime_subscriptions_database_id_databases_id_fk" FOREIGN KEY ("database_id") REFERENCES "public"."databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "database_extensions" ADD CONSTRAINT "database_extensions_database_id_databases_id_fk" FOREIGN KEY ("database_id") REFERENCES "public"."databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preview_deployments" ADD CONSTRAINT "preview_deployments_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "database_webhooks" ADD CONSTRAINT "database_webhooks_database_id_databases_id_fk" FOREIGN KEY ("database_id") REFERENCES "public"."databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_webhook_id_database_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."database_webhooks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cron_jobs" ADD CONSTRAINT "cron_jobs_hosting_account_id_hosting_accounts_id_fk" FOREIGN KEY ("hosting_account_id") REFERENCES "public"."hosting_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ftp_accounts" ADD CONSTRAINT "ftp_accounts_hosting_account_id_hosting_accounts_id_fk" FOREIGN KEY ("hosting_account_id") REFERENCES "public"."hosting_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hosting_accounts" ADD CONSTRAINT "hosting_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "php_settings" ADD CONSTRAINT "php_settings_hosting_account_id_hosting_accounts_id_fk" FOREIGN KEY ("hosting_account_id") REFERENCES "public"."hosting_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_installations" ADD CONSTRAINT "app_installations_app_id_marketplace_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."marketplace_apps"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_installations" ADD CONSTRAINT "app_installations_hosting_account_id_hosting_accounts_id_fk" FOREIGN KEY ("hosting_account_id") REFERENCES "public"."hosting_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cf_workflows" ADD CONSTRAINT "cf_workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloudflare_pages" ADD CONSTRAINT "cloudflare_pages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloudflare_pages" ADD CONSTRAINT "cloudflare_pages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "containers" ADD CONSTRAINT "containers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "durable_objects" ADD CONSTRAINT "durable_objects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "durable_objects" ADD CONSTRAINT "durable_objects_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_service" ADD CONSTRAINT "email_service_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sandboxes" ADD CONSTRAINT "sandboxes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "worker_observability" ADD CONSTRAINT "worker_observability_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workers" ADD CONSTRAINT "workers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workers" ADD CONSTRAINT "workers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workers_for_platforms" ADD CONSTRAINT "workers_for_platforms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cache_reserve" ADD CONSTRAINT "cache_reserve_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "d1_databases" ADD CONSTRAINT "d1_databases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "d1_databases" ADD CONSTRAINT "d1_databases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_platform" ADD CONSTRAINT "data_platform_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hyperdrive_databases" ADD CONSTRAINT "hyperdrive_databases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kv_entries" ADD CONSTRAINT "kv_entries_namespace_id_kv_namespaces_id_fk" FOREIGN KEY ("namespace_id") REFERENCES "public"."kv_namespaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kv_namespaces" ADD CONSTRAINT "kv_namespaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kv_namespaces" ADD CONSTRAINT "kv_namespaces_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "queues" ADD CONSTRAINT "queues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "queues" ADD CONSTRAINT "queues_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r2_buckets" ADD CONSTRAINT "r2_buckets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r2_buckets" ADD CONSTRAINT "r2_buckets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r2_objects" ADD CONSTRAINT "r2_objects_bucket_id_r2_buckets_id_fk" FOREIGN KEY ("bucket_id") REFERENCES "public"."r2_buckets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_gateway" ADD CONSTRAINT "ai_gateway_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_gateway" ADD CONSTRAINT "ai_gateway_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_search" ADD CONSTRAINT "ai_search_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_search" ADD CONSTRAINT "ai_search_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vectorize_indexes" ADD CONSTRAINT "vectorize_indexes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vectorize_indexes" ADD CONSTRAINT "vectorize_indexes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workers_ai" ADD CONSTRAINT "workers_ai_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workers_ai" ADD CONSTRAINT "workers_ai_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "realtime_kit" ADD CONSTRAINT "realtime_kit_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "realtime_kit" ADD CONSTRAINT "realtime_kit_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "streams" ADD CONSTRAINT "streams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "streams" ADD CONSTRAINT "streams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_side_security" ADD CONSTRAINT "client_side_security_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_side_security" ADD CONSTRAINT "client_side_security_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ddos_protection" ADD CONSTRAINT "ddos_protection_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ddos_protection" ADD CONSTRAINT "ddos_protection_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "magic_transit" ADD CONSTRAINT "magic_transit_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "network_firewall" ADD CONSTRAINT "network_firewall_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rate_limiting" ADD CONSTRAINT "rate_limiting_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rate_limiting" ADD CONSTRAINT "rate_limiting_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssl_certificates" ADD CONSTRAINT "ssl_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ssl_certificates" ADD CONSTRAINT "ssl_certificates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "turnstile" ADD CONSTRAINT "turnstile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "turnstile" ADD CONSTRAINT "turnstile_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waf_rules" ADD CONSTRAINT "waf_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waf_rules" ADD CONSTRAINT "waf_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_shield" ADD CONSTRAINT "api_shield_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_shield" ADD CONSTRAINT "api_shield_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_management" ADD CONSTRAINT "bot_management_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_management" ADD CONSTRAINT "bot_management_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cdn_config" ADD CONSTRAINT "cdn_config_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cdn_config" ADD CONSTRAINT "cdn_config_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cf_dns_records" ADD CONSTRAINT "cf_dns_records_zone_id_dns_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."dns_zones"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dns_zones" ADD CONSTRAINT "dns_zones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dns_zones" ADD CONSTRAINT "dns_zones_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_routing" ADD CONSTRAINT "email_routing_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_routing" ADD CONSTRAINT "email_routing_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "load_balancers" ADD CONSTRAINT "load_balancers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "load_balancers" ADD CONSTRAINT "load_balancers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log_explorer" ADD CONSTRAINT "log_explorer_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log_explorer" ADD CONSTRAINT "log_explorer_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "network_interconnect" ADD CONSTRAINT "network_interconnect_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "spectrum_apps" ADD CONSTRAINT "spectrum_apps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waiting_room" ADD CONSTRAINT "waiting_room_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waiting_room" ADD CONSTRAINT "waiting_room_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "browser_isolation" ADD CONSTRAINT "browser_isolation_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "browser_isolation" ADD CONSTRAINT "browser_isolation_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "casb" ADD CONSTRAINT "casb_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "casb" ADD CONSTRAINT "casb_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_loss_prevention" ADD CONSTRAINT "data_loss_prevention_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_loss_prevention" ADD CONSTRAINT "data_loss_prevention_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_security" ADD CONSTRAINT "email_security_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_security" ADD CONSTRAINT "email_security_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "magic_mesh" ADD CONSTRAINT "magic_mesh_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "magic_mesh" ADD CONSTRAINT "magic_mesh_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "magic_wan" ADD CONSTRAINT "magic_wan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "magic_wan" ADD CONSTRAINT "magic_wan_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secure_web_gateway" ADD CONSTRAINT "secure_web_gateway_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secure_web_gateway" ADD CONSTRAINT "secure_web_gateway_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zero_trust_access" ADD CONSTRAINT "zero_trust_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zero_trust_access" ADD CONSTRAINT "zero_trust_access_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "domain_marketplace" ADD CONSTRAINT "domain_marketplace_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "domain_privacy" ADD CONSTRAINT "domain_privacy_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "domain_transfers" ADD CONSTRAINT "domain_transfers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "domain_vault" ADD CONSTRAINT "domain_vault_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "free_dns" ADD CONSTRAINT "free_dns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handshake_domains" ADD CONSTRAINT "handshake_domains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_listing_id_domain_marketplace_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."domain_marketplace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "premium_dns" ADD CONSTRAINT "premium_dns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whois_lookups" ADD CONSTRAINT "whois_lookups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anti_spam_protection" ADD CONSTRAINT "anti_spam_protection_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyber_insurance" ADD CONSTRAINT "cyber_insurance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dedicated_servers" ADD CONSTRAINT "dedicated_servers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fast_vpn" ADD CONSTRAINT "fast_vpn_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hacked_website_sos" ADD CONSTRAINT "hacked_website_sos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_policy_id_cyber_insurance_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."cyber_insurance"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public_dns_resolver" ADD CONSTRAINT "public_dns_resolver_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "security_findings" ADD CONSTRAINT "security_findings_security_id_website_security_id_fk" FOREIGN KEY ("security_id") REFERENCES "public"."website_security"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_migrations" ADD CONSTRAINT "site_migrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "website_security" ADD CONSTRAINT "website_security_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_card_projects" ADD CONSTRAINT "business_card_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_names" ADD CONSTRAINT "business_names_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_starter_kits" ADD CONSTRAINT "business_starter_kits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "font_maker_projects" ADD CONSTRAINT "font_maker_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "knowledgebase_articles" ADD CONSTRAINT "knowledgebase_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logo_maker_projects" ADD CONSTRAINT "logo_maker_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relate_ads" ADD CONSTRAINT "relate_ads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relate_brand_monitoring" ADD CONSTRAINT "relate_brand_monitoring_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relate_local" ADD CONSTRAINT "relate_local_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relate_reviews" ADD CONSTRAINT "relate_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relate_seo" ADD CONSTRAINT "relate_seo_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relate_social" ADD CONSTRAINT "relate_social_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_maker_projects" ADD CONSTRAINT "site_maker_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_promos" ADD CONSTRAINT "user_promos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_promos" ADD CONSTRAINT "user_promos_promo_id_promo_codes_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_ssl_certificates" ADD CONSTRAINT "user_ssl_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_ssl_certificates" ADD CONSTRAINT "user_ssl_certificates_catalog_id_ssl_catalog_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."ssl_catalog"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_directory" ADD CONSTRAINT "agency_directory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_hosting" ADD CONSTRAINT "agency_hosting_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_agent_deployments" ADD CONSTRAINT "ai_agent_deployments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_newsletter_campaigns" ADD CONSTRAINT "ai_newsletter_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_hosting_instances" ADD CONSTRAINT "cloud_hosting_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_builder_projects" ADD CONSTRAINT "ecommerce_builder_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "educational_partnerships" ADD CONSTRAINT "educational_partnerships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "google_workspace" ADD CONSTRAINT "google_workspace_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "horizons_projects" ADD CONSTRAINT "horizons_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hostinger_api_keys" ADD CONSTRAINT "hostinger_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_in_bio" ADD CONSTRAINT "link_in_bio_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "minecraft_servers" ADD CONSTRAINT "minecraft_servers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "n8n_instances" ADD CONSTRAINT "n8n_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "print_on_demand" ADD CONSTRAINT "print_on_demand_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "woocommerce_hosting" ADD CONSTRAINT "woocommerce_hosting_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "instances" ADD CONSTRAINT "instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "container_services" ADD CONSTRAINT "container_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
