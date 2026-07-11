"use client";

import { useState, useRef, useEffect } from "react";

const suggestions = [
  "How do I deploy my Next.js app?",
  "Create a new PostgreSQL database",
  "Set up a WordPress site",
  "How to add a custom domain?",
  "Show me my resource usage",
  "What's the fastest way to build a site?",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "👋 Hi! I'm your CloudHost AI assistant. I can help you deploy apps, manage databases, set up WordPress, configure domains, and more. What would you like to do?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");

    setTimeout(() => {
      const responses: Record<string, string> = {
        "how do i deploy my next.js app": "To deploy a Next.js app:\n1. Go to **Hosting > Deployments**\n2. Click **New Deployment**\n3. Connect your Git repository or upload your code\n4. Select **Next.js** as the framework\n5. Click **Create Deployment**\n\nYour app will be built and deployed automatically with HTTPS!",
        "create a new postgresql database": "To create a database:\n1. Go to **Database > Databases**\n2. Click **New Database**\n3. Choose **PostgreSQL** as the type\n4. Give it a name and click **Provision**\n\nYour database will be ready in seconds with a connection string you can copy!",
        "set up a wordpress site": "To install WordPress:\n1. Go to **Hosting > WordPress**\n2. Click **Install WordPress**\n3. Enter your site name and choose PHP version\n4. Click **Install**\n\nWordPress will be installed with a database automatically. You'll get admin credentials on the dashboard!",
        "how to add a custom domain": "To add a custom domain:\n1. Go to **Network > Domains**\n2. Click **Add Domain**\n3. Enter your domain name\n4. Update your DNS records to point to our servers\n5. Verify ownership and enable SSL\n\nYou can also search for and register domains under **Domain Search**!",
        "show me my resource usage": "Here's your current resource usage:\n\n📦 Storage: 0 MB / 1 GB\n🗄️ Databases: 0 / 5\n🚀 Deployments: 0 / 10\n🌐 Bandwidth: 0 GB / 100 GB\n\nFor detailed stats, check the **Dashboard > Overview** page.",
        "what's the fastest way to build a site": "🚀 The fastest way is using our **AI Website Builder**!\n1. Go to **Hosting > AI Builder**\n2. Describe what you want to build\n3. AI generates your site in seconds\n4. Deploy with one click\n\nAlternatively, use the **Site Builder** for drag-and-drop, or pick a template from the **App Catalog**!",
      };

      const lower = msg.toLowerCase();
      let response = "I can help you with that! Could you be more specific? Try asking about:\n- Deploying apps\n- Creating databases\n- Setting up WordPress\n- Adding domains\n- Resource usage\n- Building a site";

      for (const [key, val] of Object.entries(responses)) {
        if (lower.includes(key)) {
          response = val;
          break;
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-gray-500">Ask anything about managing your cloud platform</p>
      </div>

      <div className="card flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              className="input-field flex-1" placeholder="Ask me anything..." />
            <button onClick={() => sendMessage(input)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
