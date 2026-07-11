"use client"

import { ClockIcon, QueueListIcon, ArrowsRightLeftIcon, BoltIcon, PuzzlePieceIcon, LinkIcon, CodeBracketIcon, KeyIcon, CloudIcon } from "@heroicons/react/24/outline"

const cards = [
  {
    title: "Cloud Scheduler",
    description: "Managed cron job service for scheduling virtually any job, including batch, big data, and infrastructure operations.",
    icon: ClockIcon,
  },
  {
    title: "Cloud Tasks",
    description: "Asynchronous task execution with reliable delivery, retries, and rate limiting for distributed applications.",
    icon: QueueListIcon,
  },
  {
    title: "Workflows",
    description: "Orchestration of HTTP services with step-based workflows, error handling, and parallel execution.",
    icon: ArrowsRightLeftIcon,
  },
  {
    title: "Eventarc",
    description: "Modern event delivery platform for building event-driven architectures across GCP services and third-party sources.",
    icon: BoltIcon,
  },
  {
    title: "Application Integration",
    description: "Enterprise application integration with prebuilt connectors, drag-and-drop workflows, and monitoring.",
    icon: PuzzlePieceIcon,
  },
  {
    title: "Integration Connectors",
    description: "Enterprise connectivity to SaaS applications and APIs with managed authentication and data mapping.",
    icon: LinkIcon,
  },
  {
    title: "Developer Connect",
    description: "Connect third-party source code management platforms for seamless Git-based development workflows.",
    icon: CodeBracketIcon,
  },
  {
    title: "Apigee",
    description: "Full lifecycle API management platform for designing, securing, deploying, and analyzing APIs at scale.",
    icon: KeyIcon,
  },
  {
    title: "Distributed Cloud",
    description: "GDC connected solutions and appliances for edge computing, air-gapped deployments, and regulated workloads.",
    icon: CloudIcon,
  },
]

export default function IntegrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Integration Services</h1>
        <p className="mt-1 text-sm text-gray-500">
          Messaging, event handling, API management, and enterprise connectivity tools.
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
