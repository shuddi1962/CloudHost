"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BackupsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const databaseId = searchParams.get('databaseId') || '';
  const databaseName = searchParams.get('databaseName') || 'My Database';
  const [backups, setBackups] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ frequency: 'daily', time: '03:00', retention_days: 30, enabled: true });

  const load = () => {
    if (!databaseId) return;
    fetch(`/api/backups?databaseId=${databaseId}`).then(r => r.json()).then(d => {
      setBackups(d.backups || []);
      setSchedules(d.schedules || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [databaseId]);

  const createBackup = async () => {
    setCreating(true);
    await fetch('/api/backups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ databaseId, databaseName, type: 'manual' }) });
    load();
    setTimeout(() => setCreating(false), 2000);
  };

  const restoreBackup = async (id: string) => {
    if (!confirm('Restore this backup? Current data will be replaced.')) return;
    await fetch(`/api/backups/${id}/restore`, { method: 'POST' });
    alert('Restore initiated');
  };

  const deleteBackup = async (id: string) => {
    if (!confirm('Delete this backup?')) return;
    await fetch(`/api/backups/${id}`, { method: 'DELETE' });
    load();
  };

  const saveSchedule = async () => {
    await fetch('/api/backups/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...scheduleForm, databaseId }) });
    setEditingSchedule(false);
    load();
  };

  const deleteSchedule = async (id: string) => {
    await fetch(`/api/backups/schedule?id=${id}`, { method: 'DELETE' });
    load();
  };

  if (!databaseId) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Database Backups</h1>
      <p className="text-gray-400 mb-4">Select a database to manage backups</p>
      <input placeholder="Enter database ID" className="border rounded-lg px-4 py-2 text-sm w-80" onKeyDown={e => { if (e.key === 'Enter') router.push(`/dashboard/backups?databaseId=${(e.target as HTMLInputElement).value}`); }} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Backups</h1>
          <p className="text-sm text-gray-400 mt-1">{databaseName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditingSchedule(!editingSchedule)} className="px-3 py-2 border text-sm rounded-lg hover:bg-gray-50">Schedule</button>
          <button onClick={createBackup} disabled={creating} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {creating ? 'Creating...' : '+ Backup Now'}
          </button>
        </div>
      </div>

      {/* Schedule section */}
      {editingSchedule && (
        <div className="card mb-6">
          <div className="card-body">
            <h2 className="font-semibold mb-3">Backup Schedule</h2>
            <div className="flex items-center gap-3">
              <select value={scheduleForm.frequency} onChange={e => setScheduleForm({...scheduleForm, frequency: e.target.value as any})} className="border rounded px-3 py-2 text-sm">
                <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
              </select>
              <input type="time" value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} className="border rounded px-3 py-2 text-sm" />
              <input type="number" value={scheduleForm.retention_days} onChange={e => setScheduleForm({...scheduleForm, retention_days: Number(e.target.value)})} className="border rounded px-3 py-2 text-sm w-20" placeholder="Retention (days)" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={scheduleForm.enabled} onChange={e => setScheduleForm({...scheduleForm, enabled: e.target.checked})} /> Enabled</label>
              <button onClick={saveSchedule} className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Existing schedules */}
      {schedules.length > 0 && (
        <div className="mb-6 space-y-2">
          {schedules.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="font-medium capitalize">{s.frequency}</span>
                <span className="text-gray-400">at {s.time}</span>
                <span className="text-gray-400">· {s.retention_days} day retention</span>
                {s.enabled ? <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full">Active</span> : <span className="text-xs bg-gray-100 text-gray-600 px-2 rounded-full">Paused</span>}
              </div>
              <button onClick={() => deleteSchedule(s.id)} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* Backup list */}
      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded" />)}</div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
          <p>No backups yet</p>
          <p className="text-sm mt-1">Click &quot;Backup Now&quot; to create your first backup</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((b: any) => (
            <div key={b.id} className="card">
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${b.status === 'completed' ? 'bg-green-100' : b.status === 'running' ? 'bg-blue-100' : 'bg-red-100'}`}>
                    {b.status === 'completed' ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : b.status === 'running' ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{b.type} Backup</p>
                    <p className="text-xs text-gray-400">
                      {new Date(b.created_at).toLocaleString()} · {b.size_mb ? `${b.size_mb} MB` : 'In progress...'}
                    </p>
                    {b.completed_at && <p className="text-xs text-gray-400">Completed: {new Date(b.completed_at).toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.status === 'completed' && (
                    <>
                      <button onClick={() => restoreBackup(b.id)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Restore</button>
                      <button onClick={() => deleteBackup(b.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
