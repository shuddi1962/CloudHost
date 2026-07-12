"use client";
import Link from "next/link";

const services = [
  { name: "Images", desc: "Image optimization & delivery", icon: "🖼️", route: "/cloudflare/media/images", color: "bg-rose-500", comingSoon: true },
  { name: "Stream", desc: "Video streaming & transcoding", icon: "🎬", route: "/cloudflare/media/stream", color: "bg-red-500", comingSoon: true },
  { name: "Realtime Kit", desc: "Live communications & TURN/SFU", icon: "📡", route: "/cloudflare/media/realtime-kit", color: "bg-pink-500", comingSoon: true },
];

export default function MediaPage() {
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
          s.comingSoon ? (
            <div key={s.route} className="block p-5 rounded-xl border border-gray-200 bg-white opacity-60 cursor-not-allowed">
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Coming Soon</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ) : (
            <Link key={s.route} href={s.route}
              className="block p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-brand-200 transition-all"
            >
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
