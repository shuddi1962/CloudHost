"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface Node {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  color: string;
  icon: string;
}

const nodeTypes = [
  { type: "webhook", label: "Webhook", color: "bg-purple-500", icon: "W", category: "Triggers" },
  { type: "schedule", label: "Schedule", color: "bg-orange-500", icon: "S", category: "Triggers" },
  { type: "http-request", label: "HTTP Request", color: "bg-blue-500", icon: "H", category: "Actions" },
  { type: "code", label: "Code", color: "bg-green-500", icon: "C", category: "Actions" },
  { type: "condition", label: "Condition", color: "bg-yellow-500", icon: "?", category: "Logic" },
  { type: "database", label: "Database", color: "bg-cyan-500", icon: "DB", category: "Actions" },
  { type: "email", label: "Send Email", color: "bg-red-500", icon: "@", category: "Actions" },
  { type: "slack", label: "Slack", color: "bg-indigo-500", icon: "S", category: "Integrations" },
  { type: "github", label: "GitHub", color: "bg-gray-700", icon: "GH", category: "Integrations" },
  { type: "transform", label: "Transform", color: "bg-pink-500", icon: "T", category: "Data" },
  { type: "ai", label: "AI / LLM", color: "bg-emerald-500", icon: "AI", category: "AI" },
  { type: "notification", label: "Notification", color: "bg-rose-500", icon: "N", category: "Actions" },
  { type: "telegram", label: "Telegram", color: "bg-sky-500", icon: "TG", category: "Integrations" },
  { type: "discord", label: "Discord", color: "bg-violet-500", icon: "DC", category: "Integrations" },
  { type: "loop", label: "Loop", color: "bg-teal-500", icon: "↺", category: "Logic" },
  { type: "wait", label: "Wait / Delay", color: "bg-stone-500", icon: "⏱", category: "Logic" },
];

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Record<string, string[]>>({});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showNodeSelector, setShowNodeSelector] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3001/api/workflows/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setWorkflow(data.workflow);
      setNodes(data.workflow.nodes || []);
      setConnections(data.workflow.connections || {});
    });
  }, [params.id]);

  const saveWorkflow = useCallback(async () => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/workflows/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nodes, connections }),
    });
  }, [params.id, nodes, connections]);

  const addNode = (type: string) => {
    const nodeType = nodeTypes.find(n => n.type === type);
    if (!nodeType) return;
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeType.type,
      label: `${nodeType.label} ${nodes.filter(n => n.type === type).length + 1}`,
      position: { x: 200 + (nodes.length % 3) * 220, y: 100 + Math.floor(nodes.length / 3) * 160 },
      config: {},
      color: nodeType.color,
      icon: nodeType.icon,
    };
    setNodes([...nodes, newNode]);
    setShowNodeSelector(false);
  };

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    setDraggingNode(nodeId);
    const startX = e.clientX;
    const startY = e.clientY;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setNodes(prev => prev.map(n =>
        n.id === nodeId ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n
      ));
    };
    const handleMouseUp = () => {
      setDraggingNode(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const handleOutputClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnecting(nodeId);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
      if (connecting) setConnecting(null);
    }
  };

  const handleDropZoneClick = (nodeId: string) => {
    if (connecting && connecting !== nodeId) {
      setConnections(prev => ({
        ...prev,
        [connecting]: [...(prev[connecting] || []), nodeId],
      }));
      setConnecting(null);
    }
  };

  const removeConnection = (from: string, to: string) => {
    setConnections(prev => ({
      ...prev,
      [from]: (prev[from] || []).filter(t => t !== to),
    }));
  };

  const deleteNode = (nodeId: string) => {
    const newConnections = { ...connections };
    Object.keys(newConnections).forEach(key => {
      newConnections[key] = newConnections[key].filter(t => t !== nodeId);
    });
    delete newConnections[nodeId];
    setConnections(newConnections);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n));
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  if (!workflow) return <div className="text-center py-12 text-gray-400">Loading workflow editor...</div>;

  const categorizedNodes = nodeTypes.reduce((acc: Record<string, typeof nodeTypes>, n) => {
    if (!acc[n.category]) acc[n.category] = [];
    acc[n.category].push(n);
    return acc;
  }, {});

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard/workflows")} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-semibold">{workflow.name}</h2>
            <span className="badge badge-info">{nodes.length} nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNodeSelector(true)} className="btn-primary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Node
            </button>
            <button onClick={saveWorkflow} className="btn-primary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </button>
          </div>
        </div>

        <div ref={canvasRef} className="flex-1 bg-[#f8f9fc] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px] overflow-auto relative"
          onClick={handleCanvasClick}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {Object.entries(connections).map(([from, tos]) =>
              tos.map(to => {
                const fromNode = nodes.find(n => n.id === from);
                const toNode = nodes.find(n => n.id === to);
                if (!fromNode || !toNode) return null;
                return (
                  <line key={`${from}-${to}`}
                    x1={fromNode.position.x + 100}
                    y1={fromNode.position.y + 52}
                    x2={toNode.position.x + 100}
                    y2={toNode.position.y}
                    stroke={connecting === from ? "#6366f1" : "#9ca3af"}
                    strokeWidth={2}
                    strokeDasharray={connecting === from ? "5,5" : "none"} />
                );
              })
            )}
          </svg>

          {nodes.map((node) => (
            <div key={node.id}
              className={`absolute flex flex-col items-center cursor-pointer ${selectedNode === node.id ? "z-20" : "z-10"}`}
              style={{ left: node.position.x, top: node.position.y }}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              onClick={() => handleNodeClick(node.id)}>
              <div className={`w-[200px] rounded-xl border-2 transition-all ${
                selectedNode === node.id ? "border-brand-500 shadow-lg" : "border-gray-200 shadow-sm hover:shadow-md"
              } ${draggingNode === node.id ? "shadow-xl opacity-90" : ""}`}>
                <div className={`${node.color} text-white px-3 py-2 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-white/20 w-5 h-5 rounded flex items-center justify-center">{node.icon}</span>
                    <span className="text-sm font-medium">{node.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleOutputClick(node.id, e); }}
                      className={`w-3 h-3 rounded-full border-2 border-white ${connecting === node.id ? "bg-brand-300" : "hover:bg-white/30"}`}
                      title="Connect to next node" />
                    <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                      className="text-white/70 hover:text-white text-xs ml-1">&times;</button>
                  </div>
                </div>
                <div className="bg-white px-3 py-2 rounded-b-lg text-xs text-gray-500">
                  {Object.keys(node.config).length > 0
                    ? Object.entries(node.config).map(([k, v]) => (
                        <div key={k} className="flex justify-between"><span>{k}</span><span className="text-gray-800 truncate max-w-[100px]">{String(v)}</span></div>
                      ))
                    : <span className="text-gray-400 italic">Click to configure</span>}
                </div>
              </div>
              <div className="flex gap-1 mt-1">
                {connecting && connecting !== node.id && (
                  <button onClick={() => handleDropZoneClick(node.id)}
                    className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium hover:bg-brand-200">
                    Connect here
                  </button>
                )}
              </div>
            </div>
          ))}

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-gray-500 font-medium mb-2">Empty workflow</p>
                <p className="text-gray-400 text-sm mb-4">Start by adding a trigger node</p>
                <button onClick={() => setShowNodeSelector(true)} className="btn-primary">Add First Node</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNodeSelector && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowNodeSelector(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Add Node</h2>
            {Object.entries(categorizedNodes).map(([category, nodes]) => (
              <div key={category} className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{category}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {nodes.map((node) => (
                    <button key={node.type} onClick={() => addNode(node.type)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all text-left">
                      <div className={`w-8 h-8 rounded-lg ${node.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm">{node.icon}</span>
                      </div>
                      <span className="text-sm font-medium">{node.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNodeData && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${selectedNodeData.color} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{selectedNodeData.icon}</span>
              </div>
              <h3 className="font-semibold">{selectedNodeData.label}</h3>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input value={selectedNodeData.label} onChange={e => {
                setNodes(prev => prev.map(n => n.id === selectedNodeData.id ? { ...n, label: e.target.value } : n));
              }} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <input value={selectedNodeData.type} className="input-field bg-gray-50" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Node ID</label>
              <input value={selectedNodeData.id} className="input-field bg-gray-50 text-xs" disabled />
            </div>
            <hr className="border-gray-100" />
            <p className="text-sm font-medium">Configuration</p>
            {selectedNodeData.type === "http-request" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Method</label>
                  <select className="input-field" value={selectedNodeData.config.method || "GET"}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { method: e.target.value })}>
                    <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input className="input-field" value={selectedNodeData.config.url || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { url: e.target.value })} placeholder="https://api.example.com" />
                </div>
              </>
            )}
            {selectedNodeData.type === "code" && (
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <textarea className="input-field font-mono text-xs" rows={6} value={selectedNodeData.config.code || ""}
                  onChange={e => updateNodeConfig(selectedNodeData.id, { code: e.target.value })}
                  placeholder="// JavaScript code&#10;return { result: 'data' };" />
              </div>
            )}
            {selectedNodeData.type === "condition" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Variable</label>
                  <input className="input-field" value={selectedNodeData.config.variable || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { variable: e.target.value })} placeholder="{{ $json.value }}" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Operator</label>
                  <select className="input-field" value={selectedNodeData.config.operator || "equals"}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { operator: e.target.value })}>
                    <option value="equals">Equals</option><option value="notEquals">Not Equals</option>
                    <option value="contains">Contains</option><option value="greaterThan">Greater Than</option>
                    <option value="lessThan">Less Than</option><option value="isEmpty">Is Empty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input className="input-field" value={selectedNodeData.config.value || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { value: e.target.value })} />
                </div>
              </>
            )}
            {selectedNodeData.type === "schedule" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Interval</label>
                  <select className="input-field" value={selectedNodeData.config.interval || "hourly"}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { interval: e.target.value })}>
                    <option value="everyMinute">Every Minute</option><option value="every5Minutes">Every 5 Minutes</option>
                    <option value="every15Minutes">Every 15 Minutes</option><option value="hourly">Hourly</option>
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="cron">Cron Expression</option>
                  </select>
                </div>
                {selectedNodeData.config.interval === "cron" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Cron Expression</label>
                    <input className="input-field font-mono" value={selectedNodeData.config.cron || ""}
                      onChange={e => updateNodeConfig(selectedNodeData.id, { cron: e.target.value })} placeholder="0 0 * * *" />
                  </div>
                )}
              </>
            )}
            {selectedNodeData.type === "ai" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Provider</label>
                  <select className="input-field" value={selectedNodeData.config.provider || "openai"}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { provider: e.target.value })}>
                    <option value="openai">OpenAI</option><option value="anthropic">Anthropic</option>
                    <option value="google">Google AI</option><option value="mistral">Mistral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prompt</label>
                  <textarea className="input-field font-mono text-xs" rows={4} value={selectedNodeData.config.prompt || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { prompt: e.target.value })}
                    placeholder="Enter your prompt with {{ variables }}" />
                </div>
              </>
            )}
            {selectedNodeData.type === "webhook" && (
              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                <code className="block bg-gray-50 p-2 rounded text-xs font-mono mt-1 break-all">
                  {`${window.location.origin}/webhook/${workflow.id}`}
                </code>
              </div>
            )}
            {(selectedNodeData.type === "slack" || selectedNodeData.type === "discord" || selectedNodeData.type === "telegram") && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Webhook URL / Token</label>
                  <input className="input-field" value={selectedNodeData.config.webhookUrl || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { webhookUrl: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea className="input-field" rows={3} value={selectedNodeData.config.message || ""}
                    onChange={e => updateNodeConfig(selectedNodeData.id, { message: e.target.value })} />
                </div>
              </>
            )}
            {(selectedNodeData.type === "database" || selectedNodeData.type === "email" || selectedNodeData.type === "transform" || selectedNodeData.type === "notification" || selectedNodeData.type === "loop" || selectedNodeData.type === "wait" || selectedNodeData.type === "github") && (
              <p className="text-sm text-gray-400 italic">Configure this node type in the workflow execution context</p>
            )}
          </div>

          <hr className="border-gray-100 my-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Connections</p>
            <div className="space-y-1">
              {Object.entries(connections).filter(([from]) => from === selectedNodeData.id).map(([from, tos]) =>
                tos.map(to => {
                  const toNode = nodes.find(n => n.id === to);
                  return (
                    <div key={`${from}-${to}`} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2">
                      <span>→ {toNode?.label || to}</span>
                      <button onClick={() => removeConnection(from, to)} className="text-red-400 hover:text-red-600">&times;</button>
                    </div>
                  );
                })
              )}
              {(!connections[selectedNodeData.id] || connections[selectedNodeData.id].length === 0) && (
                <p className="text-xs text-gray-400 italic">No outgoing connections</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
