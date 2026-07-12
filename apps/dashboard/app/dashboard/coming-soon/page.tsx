"use client";

import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon</h1>
        <p className="text-sm text-gray-500 mb-6">
          This feature isn&apos;t available yet. We&apos;re working on it and it will be ready soon.
        </p>
        <Link href="/dashboard" className="inline-block text-sm font-medium text-white bg-[#1c3f66] px-4 py-2 rounded hover:bg-[#2b5a8a] transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
