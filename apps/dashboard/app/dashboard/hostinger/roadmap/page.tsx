"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb, ThumbsUp, Clock,
  CheckCircle2, Circle, ArrowRight
} from "lucide-react";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  eta: string;
  votes: number;
  voted: boolean;
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "planned", label: "Planned" },
  { id: "in_progress", label: "In Progress" },
  { id: "launched", label: "Launched" },
];

const STATUS_COLORS: Record<string, string> = {
  planned: "badge-info",
  in_progress: "badge-warning",
  launched: "badge-success",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/roadmap`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  const upvote = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/roadmap/${id}/vote`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setItems(items.map((item) =>
        item.id === id
          ? { ...item, votes: item.votes + (item.voted ? -1 : 1), voted: !item.voted }
          : item
      ));
    }
  };

  const filtered = category === "all" ? items : items.filter((item) => item.status === category);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Public Roadmap</h1>
        <p className="text-gray-500">See what we're building and vote on upcoming features</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat.id
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No roadmap items</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for updates</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start gap-4">
                <button onClick={() => upvote(item.id)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    item.voted ? "bg-brand-100 text-brand-600" : "bg-gray-50 text-gray-400 hover:bg-brand-50"
                  }`}>
                  <ThumbsUp className={`w-4 h-4 ${item.voted ? "fill-current" : ""}`} />
                  <span className="text-xs font-bold mt-1">{item.votes}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="flex gap-1">
                      <span className={`badge ${STATUS_COLORS[item.status] || "badge-info"} text-[10px]`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className="badge badge-info text-[10px]">{item.category}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className={`flex items-center gap-1 ${PRIORITY_COLORS[item.priority] || ""}`}>
                      <Circle className={`w-2 h-2 ${PRIORITY_COLORS[item.priority] ? "fill-current" : ""}`} />
                      {item.priority}
                    </span>
                    {item.eta && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ETA: {item.eta}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
