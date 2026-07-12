"use client";

export default function IamPage() {
  const cards = [
    {
      title: "IAM",
      description: "Manage access control for cloud resources",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Service Accounts",
      description: "Server-to-server auth",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Groups",
      description: "Manage groups of users",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Privileged Access Manager",
      description: "Just-in-time privileged access",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Roles",
      description: "Predefined and custom IAM roles",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Workload Identity Federation",
      description: "Access GCP from non-GCP workloads",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Workforce Identity Federation",
      description: "Access GCP with external identity providers",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Principal Access Boundary",
      description: "Fine-grained access boundaries",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Managed Workload Identities",
      description: "",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Organization Policies",
      description: "Programmatic constraint enforcement",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Policy Analyzer",
      description: "Security insights preview — analyze access policies",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Policy Troubleshooter",
      description: "Diagnose access issues",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Identity-Aware Proxy (IAP)",
      description: "Control access to cloud apps",
      href: "/dashboard/coming-soon",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-xl bg-blue-50 p-6 border border-blue-100">
        <h1 className="text-2xl font-semibold text-blue-900">
          Identity and Access Management (IAM)
        </h1>
        <p className="mt-2 text-blue-700 leading-relaxed">
          IAM lets you control who (identities) has what access (roles) to
          which resources in Google Cloud. It provides fine-grained access
          control and a single unified view of security policy across your
          entire organization.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200"
          >
            <h3 className="font-medium text-blue-600 group-hover:text-blue-700">
              {card.title}
            </h3>
            {card.description && (
              <p className="mt-1 text-sm text-gray-500">{card.description}</p>
            )}
          </a>
        ))}
      </div>

      {/* Quick Info */}
      <div className="rounded-xl bg-blue-50 p-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900">
          Quick Info — What is IAM?
        </h2>
        <div className="mt-3 space-y-2 text-sm text-blue-700">
          <p>
            <strong>Who</strong> — A member can be a Google Account, a service
            account, a Google Group, a Cloud Identity domain, or a
            federated identity.
          </p>
          <p>
            <strong>Can do what</strong> — A role is a collection of
            permissions. You grant roles to members instead of assigning
            permissions directly.
          </p>
          <p>
            <strong>On which resources</strong> — Resources are organized
            hierarchically: organization → folder → project → resource.
            Permissions cascade downward.
          </p>
        </div>
      </div>
    </div>
  );
}
