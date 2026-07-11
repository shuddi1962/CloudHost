"use client";

const cards = [
  { title: "Identity Platform", description: "Google-grade identity and access management with multi-protocol support, MFA, and threat detection.", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
  { title: "Deployment Manager", description: "Templated infrastructure-as-code deployments using declarative configuration files and preview mode.", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" },
  { title: "Service Catalog", description: "Internal solutions catalog for publishing, discovering, and deploying approved cloud services and templates.", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
  { title: "Active Assist", description: "Proactively optimize your cloud environment with recommendations, insights, and automated remediation.", icon: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" },
  { title: "Carbon Footprint", description: "Track and reduce your cloud carbon emissions with detailed reporting and recommendations.", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Splunk Cloud", description: "Data-to-value platform for searching, monitoring, and analyzing machine-generated data at scale.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { title: "Cloud Assist Investigations", description: "Troubleshoot issues quickly with Cloud Assist guided investigations and diagnostics.", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { title: "Cloud Workstations", description: "Fully managed, secure, and customizable development environments in the cloud.", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { title: "Fault Injection", description: "Fault Injection Experimentation Platform for testing application resilience under failure conditions.", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" },
  { title: "Infrastructure Manager", description: "Infrastructure as Code (IaC) deployments for managing cloud resources declaratively.", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" },
  { title: "Migration Center", description: "Move on-premises workloads to Google Cloud with assessment, planning, and migration tools.", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { title: "Service Health", description: "Disruptive events impacting Google Cloud services with status updates and incident management.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Google Maps Platform", description: "Real-world insights and location experiences with Maps, Routes, Places, and Environment APIs.", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { title: "Google Earth", description: "No-code geospatial evaluation and analysis with satellite imagery and 3D mapping.", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Immersive Stream", description: "Seamless, photorealistic XR experiences for everyone with real-time 3D streaming.", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { title: "Google Workspace", description: "Transform how people work with collaboration and productivity tools like Gmail, Docs, and Meet.", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tools & Migration</h1>
        <p className="text-gray-500">Discover productivity resources for your cloud environment</p>
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
