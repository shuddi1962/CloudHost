"use client"

import Link from "next/link"

const services = [
  {
    name: "Cloud Run",
    description: "Fully managed application platform that runs stateless containers in a serverless environment with auto-scaling.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <path d="M4 22v-7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Cloud Run functions",
    description: "Event-driven serverless functions that run in response to HTTP requests or cloud events with no infrastructure management.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6M12 18v-4M9 15l3-3 3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "App Engine",
    description: "Fully managed application platform for building scalable web and mobile backends with zero server management.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="3" />
        <path d="M7 2v20M17 2v20M2 7h20M2 17h20" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "API Gateway",
    description: "Fully managed API gateway service for creating, securing, and monitoring REST APIs and gRPC services.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l9 4-9 4-9-4 9-4z" />
        <path d="M3 10l9 4 9-4" />
        <path d="M3 18l9 4 9-4" />
        <path d="M3 14l9 4 9-4" />
      </svg>
    ),
  },
  {
    name: "Endpoints",
    description: "API management platform for deploying, securing, and monitoring APIs with authentication and rate limiting.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function ServerlessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <path d="M4 22v-7" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Serverless</h1>
          </div>
          <p className="text-gray-500 ml-14">
            Run code without managing servers with fully managed compute and API services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Link
              key={service.name}
              href="#"
              className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-600 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                  {service.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
