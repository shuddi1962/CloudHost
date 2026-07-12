"use client";

export default function SettingsPage() {
  const cards = [
    {
      title: "Resource Management",
      description:
        "Organization Policies, Asset Inventory, Settings, Labels, Tags",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Manage Resources",
      description: "Create a Project",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Diagnostic Tools",
      description: "",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Security Insights preview",
      description: "",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Cloud Administration",
      description: "",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Identity & Organization",
      description: "",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Support",
      description: "Free to paid packages",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Help & Documentation",
      description: "",
      href: "/dashboard/coming-soon",
    },
    {
      title: "Service Health",
      description: "",
      href: "/dashboard/coming-soon",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Cloud Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your cloud configuration, resources, and support.
        </p>
      </div>

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
    </div>
  );
}
