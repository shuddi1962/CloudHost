"use client";

const cards = [
  { title: "Cloud Scheduler", description: "Managed cron job service for scheduling virtually any job, including batch, big data, and infrastructure operations.", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
  { title: "Cloud Tasks", description: "Asynchronous task execution with reliable delivery, retries, and rate limiting for distributed applications.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { title: "Workflows", description: "Orchestration of HTTP services with step-based workflows, error handling, and parallel execution.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581" },
  { title: "Eventarc", description: "Modern event delivery service that connects cloud services and applications through events.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { title: "Application Integration", description: "Enterprise application integration platform for connecting SaaS applications and APIs.", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { title: "Integration Connectors", description: "Enterprise Application Connectivity for integrating with third-party systems and services.", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" },
  { title: "Developer Connect", description: "Connections to third-party source code management platforms like GitHub, GitLab, and Bitbucket.", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { title: "Apigee", description: "Full lifecycle API management platform for designing, securing, deploying, and monitoring APIs.", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { title: "Distributed Cloud", description: "Managed edge infrastructure and appliances for edge and transfer workloads (GDC connected, Appliances).", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" },
];

export default function IntegrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integration Services</h1>
        <p className="text-gray-500">Enable applications and microservices to work together seamlessly</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="card p-5 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
              <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
              </svg>
            </div>
            <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{c.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
