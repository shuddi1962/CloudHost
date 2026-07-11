"use client";

const cards = [
  { title: "Cloud Build", description: "Continuous integration and delivery platform that lets you build, test, and deploy across multiple environments.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { title: "Secure Source Manager", description: "Hosted Git repositories with built-in security, access control, and audit logging for enterprise compliance.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { title: "Source Repositories", description: "Private Git repositories hosted on GCP with automatic code search, browsing, and IAM integration.", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { title: "Artifact Registry", description: "Universal build artifact management for container images, Maven, npm, and Python packages.", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { title: "Cloud Deploy", description: "Continuous delivery to GKE and Cloud Run with canary, blue-green, and rolling deployments.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { title: "GitLab", description: "Details of the GitLab SaaS Integration for CI/CD pipelines and source control.", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" },
  { title: "Gemini Code Assist", description: "AI-powered coding assistance with context-aware code completions, reviews, and chat.", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { title: "Firebase", description: "Build full stack web and mobile apps with authentication, databases, hosting, and analytics.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { title: "App Design Center", description: "Visually design applications with drag-and-drop components and auto-generated code.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

export default function CicdPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CI/CD & App Development</h1>
        <p className="text-gray-500">Integrate and deliver continuously with build, test, and deployment services</p>
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
