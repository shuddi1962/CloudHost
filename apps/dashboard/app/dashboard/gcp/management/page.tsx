"use client";

export default function ManagementPage() {
  const cards = [
    {
      title: "APIs & Services",
      description: "API management for cloud services",
      href: "#",
    },
    {
      title: "Google Auth Platform",
      description: "OAuth config and credentials",
      href: "#",
    },
    {
      title: "Billing",
      description: "Cost management and budgeting",
      href: "#",
    },
    {
      title: "Organizations",
      description: "Manage org ownership and settings",
      href: "#",
    },
    {
      title: "Google Cloud Setup",
      description: "Best-practice foundation setup",
      href: "#",
    },
    {
      title: "Admin for Gemini",
      description: "Purchase/manage Gemini products",
      href: "#",
    },
    {
      title: "Cloud Hub",
      description: "Unified cloud insights",
      href: "#",
    },
    {
      title: "Quotas & System Limits",
      description: "",
      href: "#",
    },
    {
      title: "Audit Logs",
      description: "",
      href: "#",
    },
    {
      title: "Essential Contacts",
      description: "",
      href: "#",
    },
    {
      title: "Privacy & Security",
      description: "Access Risk",
      href: "#",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Management & Admin
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage administration, security, and organization settings.
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
