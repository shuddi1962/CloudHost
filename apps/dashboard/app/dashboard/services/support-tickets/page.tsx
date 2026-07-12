"use client";

import { useEffect, useState } from "react";
import { Ticket, Plus, MessageSquare, Send, X, ArrowLeft, Clock, CheckCircle, AlertCircle, Flag } from "lucide-react";

interface TicketMsg {
  id: string;
  sender: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: TicketMsg[];
  createdAt: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/tickets`, { headers });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/tickets`, {
        method: "POST", headers,
        body: JSON.stringify({ subject, category, priority, message }),
      });
      setShowForm(false);
      setSubject(""); setCategory("technical"); setPriority("normal"); setMessage("");
      await fetchTickets();
    } catch {} finally { setSending(false); }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/tickets/${selected.id}/reply`, {
        method: "POST", headers,
        body: JSON.stringify({ message: reply.trim() }),
      });
      setReply("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/tickets`, { headers });
      const data = await res.json();
      const updated = (data.tickets || []).find((t: Ticket) => t.id === selected.id);
      if (updated) setSelected(updated);
    } catch {} finally { setSending(false); }
  };

  const closeTicket = async () => {
    if (!selected) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/tickets/${selected.id}/close`, {
        method: "POST", headers,
      });
      setSelected(null);
      await fetchTickets();
    } catch {}
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "text-red-500";
    if (p === "medium") return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-gray-500">Manage your support requests</p>
        </div>
        <button onClick={() => { setShowForm(true); setSelected(null); }} className="btn-primary">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{selected.subject}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-info text-xs">{selected.category}</span>
                  <span className={`badge ${selected.status === "open" ? "badge-success" : "badge-error"} text-xs`}>{selected.status}</span>
                  <Flag className={`w-4 h-4 ${priorityColor(selected.priority)}`} />
                </div>
              </div>
              {selected.status === "open" && (
                <button onClick={closeTicket} className="btn-danger text-sm"><X className="w-4 h-4" /> Close</button>
              )}
            </div>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {selected.messages?.map((msg) => (
                <div key={msg.id} className={`p-4 rounded-xl ${msg.sender === "user" ? "bg-brand-50 ml-8" : "bg-gray-50 mr-8"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">{msg.sender === "user" ? "You" : "Support"}</span>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                </div>
              ))}
            </div>

            {selected.status === "open" && (
              <form onSubmit={sendReply} className="border-t border-gray-100 pt-4">
                <textarea value={reply} onChange={e => setReply(e.target.value)} className="input-field mb-3" rows={3} placeholder="Type your reply..." />
                <button type="submit" disabled={sending || !reply.trim()} className="btn-primary">
                  <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Reply"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-3">
              {tickets.length === 0 && !showForm ? (
                <div className="card p-12 text-center">
                  <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No Tickets</h3>
                  <p className="text-gray-500 mb-6">Create a support ticket to get help</p>
                  <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Ticket</button>
                </div>
              ) : tickets.map(ticket => (
                <div key={ticket.id} className="card p-5 hover:shadow-md cursor-pointer transition-shadow" onClick={() => setSelected(ticket)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <Flag className={`w-4 h-4 ${priorityColor(ticket.priority)}`} />
                      </div>
                      <p className="text-xs text-gray-500">{ticket.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${ticket.status === "open" ? "badge-success" : "badge-error"} text-xs`}>{ticket.status}</span>
                      <span className="text-xs text-gray-400"><Clock className="w-3 h-3 inline" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg"><MessageSquare className="w-5 h-5 inline mr-2" />New Ticket</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createTicket}>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="input-field mb-3" placeholder="Brief description" required />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="input-field mb-4" rows={4} placeholder="Describe your issue..." required />
              <button type="submit" disabled={sending} className="btn-primary w-full">{sending ? "Submitting..." : "Submit Ticket"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
