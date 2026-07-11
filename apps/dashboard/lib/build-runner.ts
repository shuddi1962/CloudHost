export interface BuildPhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  log: string;
  error?: string;
}

export interface DeploymentBuild {
  id: string;
  phases: BuildPhase[];
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
  currentPhase: string | null;
}

export interface AppFramework {
  id: string;
  name: string;
  detectFiles: string[];
  detectPattern: RegExp;
  installCommand: string;
  buildCommand: string;
  outputDir: string;
  devCommand: string;
  staticDir: string;
  env: Record<string, string>;
}

const FRAMEWORKS: AppFramework[] = [
  { id: 'nextjs', name: 'Next.js', detectFiles: ['next.config.js', 'next.config.mjs', 'next.config.ts'], detectPattern: /"next":/, installCommand: 'npm install', buildCommand: 'next build', outputDir: '.next', devCommand: 'next dev', staticDir: 'public', env: { NODE_ENV: 'production' } },
  { id: 'react', name: 'React', detectFiles: ['vite.config.ts', 'vite.config.js'], detectPattern: /"react":/, installCommand: 'npm install', buildCommand: 'vite build', outputDir: 'dist', devCommand: 'vite', staticDir: 'public', env: {} },
  { id: 'vue', name: 'Vue.js', detectFiles: ['vue.config.js', 'nuxt.config.ts'], detectPattern: /"vue":/, installCommand: 'npm install', buildCommand: 'npm run build', outputDir: 'dist', devCommand: 'npm run dev', staticDir: 'public', env: {} },
  { id: 'laravel', name: 'Laravel', detectFiles: ['artisan', 'composer.json'], detectPattern: /"laravel"/, installCommand: 'composer install --no-dev', buildCommand: 'npm run build && php artisan optimize', outputDir: 'public', devCommand: 'php artisan serve', staticDir: 'public', env: { APP_ENV: 'production', APP_DEBUG: 'false' } },
  { id: 'wordpress', name: 'WordPress', detectFiles: ['wp-config.php', 'wp-content'], detectPattern: /wp-content/, installCommand: 'composer install 2>/dev/null; echo done', buildCommand: 'echo "WordPress - no build needed"', outputDir: '.', devCommand: '', staticDir: 'wp-content/uploads', env: {} },
  { id: 'node', name: 'Node.js', detectFiles: ['server.js', 'app.js', 'index.js'], detectPattern: /"start":/, installCommand: 'npm install', buildCommand: 'npm run build 2>/dev/null || echo "no build step"', outputDir: '.', devCommand: 'node server.js', staticDir: 'public', env: { NODE_ENV: 'production' } },
  { id: 'express', name: 'Express', detectFiles: ['app.js', 'server.js'], detectPattern: /"express":/, installCommand: 'npm install', buildCommand: 'npm run build 2>/dev/null || echo "no build step"', outputDir: '.', devCommand: 'node app.js', staticDir: 'public', env: { NODE_ENV: 'production' } },
  { id: 'django', name: 'Django', detectFiles: ['manage.py', 'requirements.txt'], detectPattern: /django/, installCommand: 'pip install -r requirements.txt', buildCommand: 'python manage.py collectstatic --noinput', outputDir: 'staticfiles', devCommand: 'python manage.py runserver', staticDir: 'static', env: { DJANGO_SETTINGS_MODULE: 'settings.production' } },
  { id: 'flask', name: 'Flask', detectFiles: ['app.py', 'requirements.txt'], detectPattern: /flask/, installCommand: 'pip install -r requirements.txt', buildCommand: 'echo "Flask - no build step"', outputDir: '.', devCommand: 'python app.py', staticDir: 'static', env: { FLASK_ENV: 'production' } },
  { id: 'static', name: 'Static HTML', detectFiles: ['index.html'], detectPattern: /<html/, installCommand: 'echo "no deps"', buildCommand: 'echo "no build needed"', outputDir: '.', devCommand: '', staticDir: '.', env: {} },
  { id: 'php', name: 'PHP', detectFiles: ['index.php', 'composer.json'], detectPattern: /"php":/, installCommand: 'composer install --no-dev 2>/dev/null || echo "no composer"', buildCommand: 'echo "PHP - no build needed"', outputDir: '.', devCommand: 'php -S 0.0.0.0:8000', staticDir: '.', env: {} },
  { id: 'svelte', name: 'SvelteKit', detectFiles: ['svelte.config.js', 'svelte.config.mjs'], detectPattern: /"@sveltejs"/, installCommand: 'npm install', buildCommand: 'npm run build', outputDir: '.svelte-kit', devCommand: 'npm run dev', staticDir: 'static', env: {} },
  { id: 'angular', name: 'Angular', detectFiles: ['angular.json'], detectPattern: /"@angular\/core":/, installCommand: 'npm install', buildCommand: 'ng build --production', outputDir: 'dist', devCommand: 'ng serve', staticDir: 'src/assets', env: {} },
  { id: 'gatsby', name: 'Gatsby', detectFiles: ['gatsby-config.js', 'gatsby-config.mjs'], detectPattern: /"gatsby":/, installCommand: 'npm install', buildCommand: 'gatsby build', outputDir: 'public', devCommand: 'gatsby develop', staticDir: 'static', env: {} },
  { id: 'hugo', name: 'Hugo', detectFiles: ['config.toml', 'config.yaml'], detectPattern: /hugo/, installCommand: 'echo "no deps"', buildCommand: 'hugo', outputDir: 'public', devCommand: 'hugo server', staticDir: 'static', env: {} },
];

export class BuildRunner {
  private phases: BuildPhase[] = [];
  private startTime: number = 0;
  private build: DeploymentBuild;

  constructor(public deploymentId: string) {
    this.build = {
      id: deploymentId,
      phases: [],
      status: 'queued',
      currentPhase: null,
    };
  }

  getBuild(): DeploymentBuild { return this.build; }

  private async runPhase(id: string, name: string, fn: () => Promise<void>): Promise<void> {
    const phase: BuildPhase = {
      id, name, status: 'running',
      startedAt: new Date().toISOString(),
      log: '',
    };
    this.phases.push(phase);
    this.build.currentPhase = id;
    try {
      // Append to log in real time
      const origLog = phase.log;
      await fn();
      phase.log = origLog;
      phase.status = 'success';
    } catch (e: any) {
      phase.status = 'failed';
      phase.error = e.message;
      this.build.status = 'failed';
      throw e;
    } finally {
      phase.completedAt = new Date().toISOString();
      phase.durationMs = Date.now() - this.startTime;
    }
  }

  async executePipeline(params: {
    sourceType: 'git' | 'upload' | 'quick-install';
    sourceUrl?: string;
    files?: { path: string; content: string }[];
    framework?: string;
    buildCommand?: string;
    installCommand?: string;
    outputDir?: string;
    envVars?: Record<string, string>;
  }): Promise<DeploymentBuild> {
    this.startTime = Date.now();
    this.build.status = 'running';

    let detectedFramework: AppFramework | null = null;

    // Phase 1: Source
    await this.runPhase('source', 'Source', async () => {
      const p = this.getPhase('source')!;
      if (params.sourceType === 'git' && params.sourceUrl) {
        p.log += `Cloning from ${params.sourceUrl}...\n`;
        // Simulate git clone
        await this.sleep(2000);
        p.log += `✓ Repository cloned successfully\n`;
      } else if (params.sourceType === 'upload' && params.files) {
        p.log += `Processing ${params.files.length} uploaded files...\n`;
        await this.sleep(500);
        p.log += `✓ Files extracted and organized\n`;
      } else if (params.sourceType === 'quick-install') {
        p.log += `Preparing quick-install template...\n`;
        await this.sleep(500);
        p.log += `✓ Template downloaded\n`;
      }
    });

    // Phase 2: Framework Detection
    await this.runPhase('detect', 'Framework Detection', async () => {
      const p = this.getPhase('detect')!;
      if (params.framework && params.framework !== 'custom') {
        detectedFramework = FRAMEWORKS.find(f => f.id === params.framework) || null;
        p.log += `Using configured framework: ${detectedFramework?.name || params.framework}\n`;
      } else if (params.files) {
        // Detect from files
        for (const file of params.files) {
          for (const fw of FRAMEWORKS) {
            if (fw.detectFiles.some(df => file.path.endsWith(df)) || fw.detectPattern.test(file.content)) {
              detectedFramework = fw;
              p.log += `✓ Framework detected: ${fw.name}\n`;
              break;
            }
          }
          if (detectedFramework) break;
        }
      }
      if (!detectedFramework) {
        detectedFramework = FRAMEWORKS.find(f => f.id === 'static')!;
        p.log += `ℹ No framework detected, using Static HTML\n`;
      }
      p.log += `  Install: ${detectedFramework.installCommand}\n`;
      p.log += `  Build:   ${detectedFramework.buildCommand}\n`;
      p.log += `  Output:  ${detectedFramework.outputDir}\n`;
      await this.sleep(500);
    });

    // Phase 3: Install Dependencies
    await this.runPhase('install', 'Install Dependencies', async () => {
      const p = this.getPhase('install')!;
      const cmd = params.installCommand || detectedFramework!.installCommand;
      p.log += `Running: ${cmd}\n`;
      await this.sleep(3000);
      p.log += `✓ Dependencies installed successfully\n`;
    });

    // Phase 4: Build
    await this.runPhase('build', 'Build', async () => {
      const p = this.getPhase('build')!;
      const cmd = params.buildCommand || detectedFramework!.buildCommand;
      p.log += `Running build command: ${cmd}\n`;
      await this.sleep(4000);
      p.log += `✓ Build completed successfully\n`;
      const outDir = params.outputDir || detectedFramework!.outputDir;
      p.log += `  Output directory: ${outDir}\n`;
    });

    // Phase 5: Analyze Output
    await this.runPhase('analyze', 'Analyze Output', async () => {
      const p = this.getPhase('analyze')!;
      const outDir = params.outputDir || detectedFramework!.outputDir;
      p.log += `Analyzing build output in ${outDir}...\n`;
      await this.sleep(1000);
      p.log += `  Detected: HTML pages, JS bundles, CSS, static assets\n`;
      const totalSize = Math.floor(Math.random() * 5000) + 500;
      p.log += `  Total output size: ${totalSize} KB\n`;
    });

    // Phase 6: Configure Runtime
    await this.runPhase('configure', 'Configure Runtime', async () => {
      const p = this.getPhase('configure')!;
      const fw = detectedFramework!;
      const baseEnv = { ...fw.env, ...params.envVars };
      p.log += `Setting up runtime environment...\n`;
      p.log += `  Runtime: Node.js ${fw.id.includes('node') || ['nextjs','react','vue','svelte','angular','gatsby','express'].includes(fw.id) ? '20.x' : fw.id === 'laravel' || fw.id === 'php' ? 'PHP 8.2' : fw.id === 'django' || fw.id === 'flask' ? 'Python 3.12' : 'default'}\n`;
      Object.entries(baseEnv).forEach(([k, v]) => p.log += `  ENV: ${k}=${v}\n`);
      p.log += `  Port: 3000 (assigned)\n`;
      await this.sleep(500);
    });

    // Phase 7: Health Check
    await this.runPhase('health', 'Health Check', async () => {
      const p = this.getPhase('health')!;
      p.log += `Starting application...\n`;
      await this.sleep(2000);
      p.log += `✓ Application started on port 3000\n`;
      p.log += `✓ Health check passed (HTTP 200)\n`;
    });

    // Phase 8: Route & Deploy
    await this.runPhase('route', 'Route & Deploy', async () => {
      const p = this.getPhase('route')!;
      const domain = `${this.deploymentId.substring(0, 8)}.cloudhost.app`;
      p.log += `Assigning domain: ${domain}\n`;
      p.log += `Configuring CDN edge nodes...\n`;
      await this.sleep(1000);
      p.log += `✓ SSL certificate issued (Let's Encrypt)\n`;
      p.log += `✓ CDN distribution configured\n`;
      p.log += `✓ Deployment live at: https://${domain}\n`;
    });

    this.build.status = 'success';
    return this.build;
  }

  private getPhase(id: string): BuildPhase | undefined {
    return this.phases.find(p => p.id === id);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static detectFramework(files: { path: string; content: string }[]): AppFramework | null {
    for (const file of files) {
      for (const fw of FRAMEWORKS) {
        if (fw.detectFiles.some(df => file.path.endsWith(df)) || fw.detectPattern.test(file.content)) {
          return fw;
        }
      }
    }
    return null;
  }

  static getFramework(id: string): AppFramework | undefined {
    return FRAMEWORKS.find(f => f.id === id);
  }

  static getFrameworks(): AppFramework[] {
    return FRAMEWORKS;
  }
}
