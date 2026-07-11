"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const Content = dynamic(() => import("./content"), { ssr: false });

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading...</div>}>
      <Content />
    </Suspense>
  );
}