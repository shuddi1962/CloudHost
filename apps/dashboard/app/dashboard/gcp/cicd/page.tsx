"use client"

import { CodeBracketIcon, ShieldCheckIcon, DocumentDuplicateIcon, ServerStackIcon, RocketLaunchIcon, GlobeAltIcon, CommandLineIcon, FireIcon, RectangleGroupIcon } from "@heroicons/react/24/outline"

const cards = [
  {
    title: "Cloud Build",
    description: "Continuous integration and delivery platform that lets you build, test, and deploy across multiple environments.",
    icon: CodeBracketIcon,
  },
  {
    title: "Secure Source Manager",
    description: "Hosted Git repositories with built-in security, access control, and audit logging for enterprise compliance.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Source Repositories",
    description: "Private Git repositories hosted on GCP with automatic code search, browsing, and IAM integration.",
    icon: DocumentDuplicateIcon,
  },
  {
    title: "Artifact Registry",
    description: "Universal artifact management for container images, Maven, npm, Python packages, and more.",
    icon: ServerStackIcon,
  },
  {
    title: "Cloud Deploy",
    description: "Continuous delivery to GKE, Cloud Run, and Anthos with progressive rollouts and deploy policies.",
    icon: RocketLaunchIcon,
  },
  {
    title: "GitLab",
    description: "SaaS integration with GitLab for source control, CI/CD pipelines, and DevOps lifecycle management.",
    icon: GlobeAltIcon,
  },
  {
    title: "Gemini Code Assist",
    description: "AI-powered coding assistance with context-aware suggestions, code generation, and natural language queries.",
    icon: CommandLineIcon,
  },
  {
    title: "Firebase",
    description: "Full-stack platform for web and mobile apps with hosting, authentication, realtime database, and serverless functions.",
    icon: FireIcon,
  },
  {
    title: "App Design Center",
    description: "Visual application design tool for prototyping, building, and iterating on cloud-native applications.",
    icon: RectangleGroupIcon,
  },
]

export default function CICDPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">CI/CD & App Development</h1>
        <p className="mt-1 text-sm text-gray-500">
          Continuous integration, delivery pipelines, source control, and application tooling.
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
