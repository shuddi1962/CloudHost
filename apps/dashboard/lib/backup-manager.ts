export interface DatabaseBackup {
  id: string;
  databaseId: string;
  database_name: string;
  type: 'manual' | 'automated';
  status: 'completed' | 'running' | 'failed';
  size_mb: number;
  file_path: string;
  created_at: string;
  completed_at?: string;
  retention_days: number;
}

export interface BackupSchedule {
  id: string;
  databaseId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  day_of_week?: number;
  day_of_month?: number;
  retention_days: number;
  enabled: boolean;
  last_backup_at?: string;
}

const backups: DatabaseBackup[] = [];
const schedules: BackupSchedule[] = [];
let autoInc = 1;

export class BackupManager {
  static async list(databaseId: string): Promise<DatabaseBackup[]> {
    return backups.filter(b => b.databaseId === databaseId);
  }

  static async create(databaseId: string, databaseName: string, type: 'manual' | 'automated' = 'manual'): Promise<DatabaseBackup> {
    const backup: DatabaseBackup = {
      id: `bkp-${Date.now()}-${autoInc++}`,
      databaseId,
      database_name: databaseName,
      type,
      status: 'running',
      size_mb: 0,
      file_path: `/backups/${databaseId}/${Date.now()}.sql.gz`,
      created_at: new Date().toISOString(),
      retention_days: 30,
    };
    backups.unshift(backup);
    setTimeout(() => {
      backup.status = 'completed';
      backup.size_mb = Math.round(10 + Math.random() * 90);
      backup.completed_at = new Date().toISOString();
    }, 3000);
    return backup;
  }

  static async restore(backupId: string): Promise<DatabaseBackup | null> {
    const backup = backups.find(b => b.id === backupId);
    if (!backup || backup.status !== 'completed') return null;
    return backup;
  }

  static async remove(backupId: string): Promise<boolean> {
    const idx = backups.findIndex(b => b.id === backupId);
    if (idx === -1) return false;
    backups.splice(idx, 1);
    return true;
  }

  static async getSchedules(databaseId: string): Promise<BackupSchedule[]> {
    return schedules.filter(s => s.databaseId === databaseId);
  }

  static async saveSchedule(data: Omit<BackupSchedule, 'id'>): Promise<BackupSchedule> {
    const existing = schedules.findIndex(s => s.databaseId === data.databaseId);
    if (existing >= 0) {
      schedules[existing] = { ...schedules[existing], ...data };
      return schedules[existing];
    }
    const schedule: BackupSchedule = { ...data, id: `bkp-sched-${Date.now()}` };
    schedules.push(schedule);
    return schedule;
  }

  static async deleteSchedule(id: string): Promise<boolean> {
    const idx = schedules.findIndex(s => s.id === id);
    if (idx === -1) return false;
    schedules.splice(idx, 1);
    return true;
  }
}
