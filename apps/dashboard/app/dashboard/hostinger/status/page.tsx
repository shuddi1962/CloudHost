"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, Info, AlertTriangle,
  AlertOctagon, Clock, RefreshCw
} from "lucide-react";

interface StatusEvent {
  id: string;
  title: string;
  severity: string;
  status: string;
  description: string;
  updates: { message: string; timestamp: string }[];
  timestamp: string;
}

const SEVERITY_ICONS: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
  resolved: CheckCircle,
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "badge-info",
  warning: "badge-warning",
  critical: "badge-error",
  resolved: "badge-success",
};

export default function StatusPage() {
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStatus = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStatus(); }, []);

  const hasIssues = events.some((e) => e.severity !== "resolved");

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Status</h1>
          <p className="text-gray-500">Real-time system status and incident history</p>
        </div>
        <button onClick={loadStatus} className="btn-secondary">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className={`card p-6 ${hasIssues ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
        <div className="flex items-center gap-3">
          {hasIssues ? (
            <><XCircle className="w-8 h-8 text-red-500" />
              <div>
                <h2 className="font-semibold text-red-800">Issues Detected</h2>
                <p className="text-sm text-red-600">Some systems are experiencing issues</p>
              </div>
            </>
          ) : (
            <><CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h2 className="font-semibold text-green-800">All Systems Operational</h2>
                <p className="text-sm text-green-600">All services are running normally</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No events recorded</p>
              </div>
            </div>
          ) : (
            events.map((event) => {
              const SevIcon = SEVERITY_ICONS[event.severity] || Info;
              return (
                <div key={event.id} className="relative pl-10">
                  <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center
                    ${event.severity === "critical" ? "bg-red-100" :
                      event.severity === "warning" ? "bg-yellow-100" :
                      event.severity === "resolved" ? "bg-green-100" : "bg-blue-100"}`}>
                    <SevIcon className={`w-3 h-3 ${
                      event.severity === "critical" ? "text-red-500" :
                      event.severity === "warning" ? "text-yellow-500" :
                      event.severity === "resolved" ? "text-green-500" : "text-blue-500"}`} />
                  </div>
                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{event.title}</h3>
                      <div className="flex gap-2">
                        <span className={`badge ${SEVERITY_COLORS[event.severity] || "badge-info"} text-[10px]`}>
                          {event.severity}
                        </span>
                        <span className="badge badge-info text-[10px]">{event.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.updates?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {event.updates.map((u, i) => (
                          <div key={i} className="text-xs">
                            <p className="text-gray-500">{u.message}</p>
                            <p className="text-gray-400 text-[10px]">{new Date(u.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
