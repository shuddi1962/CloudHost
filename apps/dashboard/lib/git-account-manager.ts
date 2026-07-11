export interface GitAccount {
  id: string;
  provider: 'github' | 'gitlab';
  username: string;
  avatar_url: string;
  access_token: string;
  connected_at: string;
  repos_count: number;
}

const accounts: GitAccount[] = [];

export class GitAccountManager {
  static async list(): Promise<GitAccount[]> { return accounts; }

  static async get(id: string): Promise<GitAccount | undefined> { return accounts.find(a => a.id === id); }

  static async connect(provider: 'github' | 'gitlab', code: string): Promise<GitAccount> {
    const token = `gho_${Math.random().toString(36).slice(2, 20)}${Math.random().toString(36).slice(2, 20)}`;
    const account: GitAccount = {
      id: `git-${provider}-${Date.now()}`,
      provider,
      username: `user_${Math.random().toString(36).slice(2, 8)}`,
      avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000)}`,
      access_token: token,
      connected_at: new Date().toISOString(),
      repos_count: Math.floor(Math.random() * 20) + 3,
    };
    accounts.unshift(account);
    return account;
  }

  static async disconnect(id: string): Promise<boolean> {
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) return false;
    accounts.splice(idx, 1);
    return true;
  }

  static async listRepos(accountId: string): Promise<any[]> {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return [];

    return Array.from({ length: account.repos_count }, (_, i) => ({
      id: `repo-${accountId}-${i}`,
      name: [`nextjs-blog`, `api-service`, `ecommerce`, `landing-page`, `web-app`, `docs-site`, `mobile-api`, `admin-dashboard`][i % 8],
      full_name: `${account.username}/${[`nextjs-blog`, `api-service`, `ecommerce`, `landing-page`, `web-app`, `docs-site`, `mobile-api`, `admin-dashboard`][i % 8]}`,
      private: i % 3 === 0,
      default_branch: 'main',
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
    }));
  }
}
