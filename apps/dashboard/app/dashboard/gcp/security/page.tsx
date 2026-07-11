"use client"

import Link from "next/link"

const services = [
  {
    name: "Security Command Center",
    description: "Centralized vulnerability and threat monitoring for your entire GCP organization with actionable insights.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l7 4v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V6l7-4z" />
      </svg>
    ),
  },
  {
    name: "Compliance",
    description: "Managed compliance framework covering SOC, PCI DSS, HIPAA, FedRAMP, and regional data protection laws.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 2l7 4v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V6l7-4z" />
      </svg>
    ),
  },
  {
    name: "Cloud KMS",
    description: "Key Management Service for creating, managing, and using encryption keys on Google Cloud.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Secret Manager",
    description: "Secure storage for API keys, passwords, certificates, and other sensitive configuration data.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Certificate Authority Service",
    description: "Managed private CA for issuing, managing, and revoking TLS certificates for internal workloads.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    name: "Access Transparency",
    description: "Audit trail of Google staff access to your data with near-real-time logs and notifications.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    name: "VPC Service Controls",
    description: "Perimeter security for Google Cloud services to prevent data exfiltration and unauthorized access.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 3v18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Cloud Armor",
    description: "DDoS protection and web application firewall to defend your applications at the edge.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l5.5 3.5L12 9l-5.5-3.5L12 2z" />
        <path d="M12 9v13" />
        <path d="M6.5 5.5V12c0 3 5.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5V5.5" />
      </svg>
    ),
  },
  {
    name: "reCAPTCHA Enterprise",
    description: "Advanced bot detection and fraud prevention using risk analysis and adaptive authentication.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10 10 10 0 01-10-10 10 10 0 0110-10z" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Chronicle Security Operations",
    description: "Google-powered SIEM platform for security telemetry, investigation, and threat detection at scale.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10 10 10 0 01-10-10 10 10 0 0110-10z" />
        <path d="M12 6v6l-4 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Risk Manager",
    description: "Assess, monitor, and mitigate third-party risk across your vendor ecosystem with automated reviews.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        <circle cx="12" cy="12" r="7" />
      </svg>
    ),
  },
  {
    name: "Assured Workloads",
    description: "Regulatory compliance controls for controlled data with region-specific encryption and access policies.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3 6 6 .5-4.5 4.5L18 20l-6-3.5L6 20l1.5-7L2 8.5 9 8l3-6z" />
      </svg>
    ),
  },
  {
    name: "Access Approval",
    description: "Explicit approval workflows for Google staff access to your data with customer-managed controls.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4" />
        <path d="M5 18l2-4-1-3-3 1 2 6z" />
        <path d="M19 18l-2-4 1-3 3 1-2 6z" />
      </svg>
    ),
  },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l7 4v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V6l7-4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Security</h1>
          </div>
          <p className="text-gray-500 ml-14">
            Identity, encryption, compliance, and threat protection services for your cloud infrastructure.
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
