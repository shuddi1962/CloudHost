"use client"

import { UserGroupIcon, CubeIcon, Squares2X2Icon, ChartBarIcon, GlobeAltIcon, CloudIcon, MagnifyingGlassIcon, ComputerDesktopIcon, ExclamationTriangleIcon, ServerStackIcon, ArrowPathIcon, HeartIcon, MapIcon, GlobeAmericasIcon, PlayCircleIcon, BriefcaseIcon } from "@heroicons/react/24/outline"

const cards = [
  {
    title: "Identity Platform",
    description: "Google-grade identity and access management with multi-protocol support, MFA, and threat detection.",
    icon: UserGroupIcon,
  },
  {
    title: "Deployment Manager",
    description: "Templated infrastructure-as-code deployments using declarative configuration files and preview mode.",
    icon: CubeIcon,
  },
  {
    title: "Service Catalog",
    description: "Internal solutions catalog for publishing, discovering, and deploying approved cloud services and templates.",
    icon: Squares2X2Icon,
  },
  {
    title: "Active Assist",
    description: "Proactive optimization recommendations for cost, security, performance, and reliability across your GCP environment.",
    icon: ChartBarIcon,
  },
  {
    title: "Carbon Footprint",
    description: "Cloud carbon emissions tracking and reporting with per-project, per-region granularity and reduction insights.",
    icon: GlobeAltIcon,
  },
  {
    title: "Splunk Cloud",
    description: "Data-to-value platform for searching, monitoring, and analyzing machine-generated data at enterprise scale.",
    icon: CloudIcon,
  },
  {
    title: "Cloud Assist Investigations",
    description: "Guided investigation tool for diagnosing and resolving cloud infrastructure, networking, and security issues.",
    icon: MagnifyingGlassIcon,
  },
  {
    title: "Cloud Workstations",
    description: "Fully managed, secure development environments in the cloud with preconfigured toolchains and IDE support.",
    icon: ComputerDesktopIcon,
  },
  {
    title: "Fault Injection Platform",
    description: "Chaos engineering platform for injecting faults and testing system resilience under real-world failure conditions.",
    icon: ExclamationTriangleIcon,
  },
  {
    title: "Infrastructure Manager",
    description: "IaC deployments with Terraform, config management, and policy enforcement for multi-cloud infrastructure.",
    icon: ServerStackIcon,
  },
  {
    title: "Migration Center",
    description: "Move on-premises workloads to GCP with assessment, planning, migration waves, and cost estimation tools.",
    icon: ArrowPathIcon,
  },
  {
    title: "Service Health",
    description: "Real-time visibility into disruptive events, outages, and maintenance affecting your GCP services and regions.",
    icon: HeartIcon,
  },
  {
    title: "Google Maps Platform",
    description: "Location-based services including maps, routes, places, and real-time traffic data for web and mobile apps.",
    icon: MapIcon,
  },
  {
    title: "Google Earth",
    description: "No-code geospatial analysis and visualization platform for creating and sharing Earth-based imagery and data.",
    icon: GlobeAmericasIcon,
  },
  {
    title: "Immersive Stream",
    description: "Photorealistic XR streaming for delivering high-fidelity 3D, AR, and VR experiences on any device.",
    icon: PlayCircleIcon,
  },
  {
    title: "Google Workspace",
    description: "Enterprise productivity suite with collaboration tools, email, docs, and seamless GCP integrations.",
    icon: BriefcaseIcon,
  },
]

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tools & Migration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Identity, infrastructure tooling, migration services, and productivity platforms.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="group relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-600"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-gray-900">{card.title}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{card.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
