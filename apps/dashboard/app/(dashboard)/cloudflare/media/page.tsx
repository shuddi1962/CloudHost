"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const services = [
  { name: "Images", desc: "Image optimization & delivery", icon: "🖼️", route: "/cloudflare/media/images", color: "bg-rose-500" },
  { name: "Stream", desc: "Video streaming & transcoding", icon: "🎬", route: "/cloudflare/media/stream", color: "bg-red-500" },
  { name: "RealtimeKit", desc: "Live communications & TURN/SFU", icon: "📡", route: "/cloudflare/media/realtime-kit", color: "bg-pink-500" },
];

export default function MediaPage() {
  const [imageCount, setImageCount] = useState(0);
  const [streamCount, setStreamCount] = useState(0);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch("/api/cloudflare/media/images", { headers: h }).then(r => r.json()).then(d => setImageCount((d.images || []).length)).catch(() => {});
    fetch("/api/cloudflare/media/stream", { headers: h }).then(r => r.json()).then(d => setStreamCount((d.streams || []).length)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media</h1>
          <p className="text-gray-500">Images, video streaming, and real-time communications</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((s) => (
          <Link key={s.route} href={s.route}
            className="block p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-brand-200 transition-all"
          >
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-white"><h3 className="font-semibold text-sm mb-2">Images</h3><p className="text-2xl font-bold text-rose-600">{imageCount}</p></div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white"><h3 className="font-semibold text-sm mb-2">Streams</h3><p className="text-2xl font-bold text-red-600">{streamCount}</p></div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white"><h3 className="font-semibold text-sm mb-2">Realtime Apps</h3><p className="text-2xl font-bold text-pink-600">0</p></div>
      </div>
    </div>
  );
}
