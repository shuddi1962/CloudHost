"use client";

export default function Web3Page() {
  const cards = [
    {
      title: "Blockchain Node Engine",
      description: "Fully managed blockchain node hosting",
      href: "#",
    },
    {
      title: "Blockchain RPC",
      description: "Enterprise-grade RPC for building on blockchain",
      href: "#",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Web3</h1>
        <p className="mt-1 text-sm text-gray-500">
          Blockchain and Web3 services on Google Cloud.
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
            <p className="mt-1 text-sm text-gray-500">{card.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
