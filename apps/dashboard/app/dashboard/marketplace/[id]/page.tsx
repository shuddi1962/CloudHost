import dynamic from "next/dynamic";
import { Suspense } from "react";

const Content = dynamic(() => import("./content"), { ssr: false });

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading product...</div>}>
      <Content />
    </Suspense>
  );
}
