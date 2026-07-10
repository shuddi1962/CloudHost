import Link from "next/link";

const quickActions = [
  { href: "/dashboard/projects", label: "New Project", desc: "Create a new project", color: "bg-blue-500" },
  { href: "/dashboard/deployments", label: "Deploy App", desc: "Next.js, Node, PHP, static", color: "bg-purple-500" },
  { href: "/dashboard/databases", label: "Create Database", desc: "PostgreSQL, MySQL, Redis", color: "bg-green-500" },
  { href: "/dashboard/workflows", label: "New Workflow", desc: "Build automation workflows", color: "bg-orange-500" },
  { href: "/dashboard/wordpress", label: "Install WordPress", desc: "Launch a WordPress site", color: "bg-cyan-500" },
  { href: "/dashboard/domains", label: "Add Domain", desc: "Connect your custom domain", color: "bg-indigo-500" },
  { href: "/dashboard/vps", label: "Deploy VPS", desc: "Virtual private server", color: "bg-red-500" },
  { href: "/dashboard/ai-builder", label: "AI Builder", desc: "AI website generator", color: "bg-pink-500" },
  { href: "/dashboard/site-builder", label: "Site Builder", desc: "Drag & drop builder", color: "bg-teal-500" },
  { href: "/dashboard/app-catalog", label: "App Catalog", desc: "1-click app deploy", color: "bg-yellow-500" },
  { href: "/dashboard/edge-functions", label: "Edge Functions", desc: "Serverless functions", color: "bg-violet-500" },
  { href: "/dashboard/domains/search", label: "Find Domain", desc: "Search & register domains", color: "bg-sky-500" },
];

const stats = [
  { label: "Projects", value: "0", href: "/dashboard/projects", color: "text-blue-600" },
  { label: "Deployments", value: "0", href: "/dashboard/deployments", color: "text-purple-600" },
  { label: "Databases", value: "0", href: "/dashboard/databases", color: "text-green-600" },
  { label: "VPS Servers", value: "0", href: "/dashboard/vps", color: "text-red-600" },
  { label: "WordPress Sites", value: "0", href: "/dashboard/wordpress", color: "text-cyan-600" },
  { label: "Workflows", value: "0", href: "/dashboard/workflows", color: "text-orange-600" },
  { label: "Domains", value: "0", href: "/dashboard/domains", color: "text-indigo-600" },
  { label: "Edge Functions", value: "0", href: "/dashboard/edge-functions", color: "text-violet-600" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to CloudHost — your all-in-one cloud platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-5 hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all group">
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-lg">
                  {action.label[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-brand-700 transition-colors">{action.label}</p>
                <p className="text-sm text-gray-500">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Your activity will appear here</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Resource Usage</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Storage</span>
                <span className="text-gray-500">0 MB / 1 GB</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-brand-500 rounded-full h-2" style={{ width: "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Databases</span>
                <span className="text-gray-500">0 / 5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 rounded-full h-2" style={{ width: "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Deployments</span>
                <span className="text-gray-500">0 / 10</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-purple-500 rounded-full h-2" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
