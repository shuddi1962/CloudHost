"use client"

import Link from "next/link"

const services = [
  {
    name: "Vertex AI",
    description: "Custom model training, deployment, and management platform with AutoML and foundation model access.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 014 4c0 2-4 6-4 6s-4-4-4-6a4 4 0 014-4z" />
        <path d="M8 14h8" strokeLinecap="round" />
        <path d="M12 14v6" strokeLinecap="round" />
        <path d="M7 20h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Gemini Enterprise",
    description: "Enterprise-grade Gemini AI assistant with advanced reasoning, coding, and multimodal capabilities.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 9h7l2-7z" />
      </svg>
    ),
  },
  {
    name: "Agent Platform",
    description: "Build, deploy, and manage AI agents with access to enterprise data, tools, and orchestration workflows.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="4" />
        <circle cx="9" cy="10" r="2" />
        <circle cx="15" cy="10" r="2" />
        <path d="M7 16c1.5-2 4.5-2 6 0s4.5-2 6 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Document AI",
    description: "AI-powered document processing with OCR, classification, entity extraction, and workflow automation.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6M9 15h6M9 11h6M9 19h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Translation AI",
    description: "Neural machine translation supporting over 100 languages with custom model training and glossary support.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 5h16M4 12h12M4 19h8" strokeLinecap="round" />
        <path d="M14 5l-4 14M18 5l4 14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Speech-to-Text / Text-to-Speech",
    description: "Real-time audio transcription and natural-sounding speech synthesis with 125+ languages and voices.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 00-4 4v4a4 4 0 008 0V6a4 4 0 00-4-4z" />
        <path d="M6 11v1a6 6 0 0012 0v-1" strokeLinecap="round" />
        <path d="M12 17v5M8 22h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Discovery Engine",
    description: "AI-powered enterprise search and recommendation engine for unstructured data across any source.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        <path d="M11 8v6M8 11h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "AI Commerce Search",
    description: "AI-driven product discovery and search with visual matching, personalization, and natural language queries.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <path d="M3 6h18" strokeLinecap="round" />
        <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Talent Solution",
    description: "Job search and talent matching ML service with semantic search, recommendations, and employer branding.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 22v-2a7 7 0 0114 0v2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Vertex AI Vision",
    description: "Custom computer vision model training and deployment for image classification, detection, and segmentation.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    name: "NotebookLM for Enterprise",
    description: "AI-powered notebook for enterprise research, meeting summarization, and document analysis with Gemini.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: "CCAI Platform",
    description: "Contact Center AI platform for intelligent virtual agents, agent assist, and conversational analytics.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    name: "AI Edge Portal",
    description: "Deploy and manage AI models on edge devices with optimized inference, monitoring, and model updates.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 014 4c0 2-4 6-4 6s-4-4-4-6a4 4 0 014-4z" />
                <path d="M8 14h8" strokeLinecap="round" />
                <path d="M12 14v6" strokeLinecap="round" />
                <path d="M7 20h10" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI & ML</h1>
          </div>
          <p className="text-gray-500 ml-14">
            Artificial intelligence and machine learning services from pre-built APIs to custom model training.
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
