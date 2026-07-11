export interface WordPressSite {
  id: string;
  userId: string;
  domain: string;
  siteName: string;
  adminEmail: string;
  adminUser: string;
  adminPassword: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbHost: string;
  version: string;
  status: 'installing' | 'active' | 'updating' | 'error';
  plugins: string[];
  theme: string;
  autoUpdate: boolean;
  sslEnabled: boolean;
  createdAt: string;
}

const WP_VERSIONS = ['6.7', '6.6', '6.5', '6.4'];
const DEFAULT_PLUGINS = ['akismet', 'hello-dolly', 'wordpress-seo', 'jetpack', 'w3-total-cache', 'limit-login-attempts-reloaded'];
const DEFAULT_THEME = 'twentytwentyfour';

export class WordPressManager {
  static async createSite(params: {
    userId: string;
    siteName: string;
    domain: string;
    adminEmail: string;
    adminUser?: string;
    adminPassword?: string;
    version?: string;
    plugins?: string[];
    theme?: string;
  }): Promise<WordPressSite> {
    const genPassword = () => Math.random().toString(36).substring(2, 18);
    const genDbName = () => `wp_${Math.random().toString(36).substring(2, 10)}`;
    const genUser = () => `wp_${Math.random().toString(36).substring(2, 10)}`;

    const site: WordPressSite = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      userId: params.userId,
      domain: params.domain,
      siteName: params.siteName,
      adminEmail: params.adminEmail,
      adminUser: params.adminUser || 'admin',
      adminPassword: params.adminPassword || genPassword(),
      dbName: genDbName(),
      dbUser: genUser(),
      dbPassword: genPassword(),
      dbHost: `mysql.internal.cloudhost.app`,
      version: params.version || WP_VERSIONS[0],
      status: 'installing',
      plugins: params.plugins || DEFAULT_PLUGINS.slice(0, 3),
      theme: params.theme || DEFAULT_THEME,
      autoUpdate: true,
      sslEnabled: true,
      createdAt: new Date().toISOString(),
    };

    // Simulate async installation
    const installSteps = [
      { msg: 'Creating MySQL database and user...', delay: 2000 },
      { msg: 'Downloading WordPress 6.7...', delay: 3000 },
      { msg: 'Extracting files...', delay: 1500 },
      { msg: 'Creating wp-config.php...', delay: 1000 },
      { msg: 'Running installation script...', delay: 2500 },
      { msg: 'Installing default plugins...', delay: 2000 },
      { msg: 'Applying security hardening...', delay: 1500 },
      { msg: 'Issuing SSL certificate...', delay: 2000 },
      { msg: 'Configuring CDN and caching...', delay: 1500 },
    ];

    let totalDelay = 0;
    for (const step of installSteps) {
      totalDelay += step.delay;
      setTimeout(async () => {
        const { createClient } = await import('@/lib/supabase-server');
        const supabase = createClient();
        const { data: existing } = await supabase.from('deployments').select('build_log').eq('id', site.id).single();
        await supabase.from('deployments').update({
          build_log: (existing?.build_log || '') + `${step.msg}\n`,
        }).eq('id', site.id);
      }, totalDelay);
    }

    setTimeout(async () => {
      const { createClient } = await import('@/lib/supabase-server');
      const supabase = createClient();
      await supabase.from('deployments').update({
        status: 'running',
        domain: site.domain,
        deployed_at: new Date().toISOString(),
      }).eq('id', site.id);

      // Create database record
      await supabase.from('databases').insert({
        user_id: site.userId,
        name: `${site.siteName}-db`,
        type: 'mysql',
        version: '8.0',
        status: 'running',
        host: site.dbHost,
        port: 3306,
        database_name: site.dbName,
        username: site.dbUser,
        password: site.dbPassword,
      });

      // Create SSL certificate
      await supabase.from('ssl_certificates').insert({
        user_id: site.userId,
        domain_name: site.domain,
        status: 'active',
        issuer: "Let's Encrypt",
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: true,
      });

      // Create DNS record
      await supabase.from('dns_records').insert({
        domain_id: null as any,
        type: 'A',
        name: site.domain,
        value: '192.168.1.1',
        ttl: 3600,
      });
    }, totalDelay + 1000);

    return site;
  }

  static async getInstallSteps(): Promise<{ icon: string; label: string; desc: string }[]> {
    return [
      { icon: 'Database', label: 'Database', desc: 'MySQL database with user' },
      { icon: 'Download', label: 'Download', desc: 'Latest WordPress core' },
      { icon: 'Code', label: 'Configure', desc: 'wp-config.php setup' },
      { icon: 'Shield', label: 'Secure', desc: 'SSL certificate' },
      { icon: 'Globe', label: 'Domain', desc: 'Custom domain mapping' },
      { icon: 'Layout', label: 'Theme', desc: 'Default theme install' },
      { icon: 'Puzzle', label: 'Plugins', desc: 'Essential plugins' },
      { icon: 'Zap', label: 'Optimize', desc: 'Caching & CDN' },
    ];
  }

  static async updateWordPress(siteId: string, version: string): Promise<void> {
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = createClient();
    await supabase.from('deployments').update({
      status: 'building',
      build_log: `Updating WordPress to v${version}...\n`,
    }).eq('id', siteId);

    setTimeout(async () => {
      await supabase.from('deployments').update({
        status: 'running',
        build_log: `✓ WordPress updated to v${version}\n`,
      }).eq('id', siteId);
    }, 5000);
  }

  static async installPlugin(siteId: string, pluginSlug: string): Promise<void> {
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = createClient();
    const { data: dep } = await supabase.from('deployments').select('*').eq('id', siteId).single();
    const plugins = (dep?.env_vars as any)?.plugins || [];
    plugins.push(pluginSlug);
    await supabase.from('deployments').update({
      env_vars: { ...(dep?.env_vars as any || {}), plugins },
    }).eq('id', siteId);
  }

  static async installTheme(siteId: string, themeSlug: string): Promise<void> {
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = createClient();
    await supabase.from('deployments').update({
      env_vars: { theme: themeSlug },
    }).eq('id', siteId);
  }

  static async getRecommendedPlugins(): Promise<{ slug: string; name: string; desc: string; category: string }[]> {
    return [
      { slug: 'wordpress-seo', name: 'Yoast SEO', desc: 'Search engine optimization toolkit', category: 'SEO' },
      { slug: 'jetpack', name: 'Jetpack', desc: 'Security, performance, and site management', category: 'Security' },
      { slug: 'w3-total-cache', name: 'W3 Total Cache', desc: 'Performance optimization & caching', category: 'Performance' },
      { slug: 'akismet', name: 'Akismet', desc: 'Spam protection for comments', category: 'Security' },
      { slug: 'elementor', name: 'Elementor', desc: 'Drag & drop page builder', category: 'Design' },
      { slug: 'woocommerce', name: 'WooCommerce', desc: 'E-commerce platform', category: 'Commerce' },
      { slug: 'contact-form-7', name: 'Contact Form 7', desc: 'Simple contact forms', category: 'Forms' },
      { slug: 'wordfence', name: 'Wordfence Security', desc: 'Firewall & malware scanner', category: 'Security' },
      { slug: 'limit-login-attempts-reloaded', name: 'Limit Login Attempts', desc: 'Brute force protection', category: 'Security' },
      { slug: 'updraftplus', name: 'UpdraftPlus', desc: 'Backup & restore', category: 'Backup' },
      { slug: 'litespeed-cache', name: 'LiteSpeed Cache', desc: 'Page caching & optimization', category: 'Performance' },
      { slug: 'smush', name: 'Smush', desc: 'Image compression & optimization', category: 'Performance' },
      { slug: 'redirection', name: 'Redirection', desc: '301 redirect manager', category: 'Tools' },
      { slug: 'wpforms', name: 'WPForms', desc: 'Drag & drop form builder', category: 'Forms' },
      { slug: 'all-in-one-seo', name: 'All in One SEO', desc: 'Complete SEO toolkit', category: 'SEO' },
      { slug: 'google-site-kit', name: 'Google Site Kit', desc: 'Google analytics & tools', category: 'Analytics' },
    ];
  }

  static async getWordPressVersions(): Promise<string[]> {
    return WP_VERSIONS;
  }

  static getAdminUrl(domain: string): string {
    return `https://${domain}/wp-admin`;
  }
}
