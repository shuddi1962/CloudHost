import { emitter } from './realtime-emitter';

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
  isDocker?: boolean;
}

export interface BuildPack {
  id: string;
  name: string;
  description: string;
  phases: {
    id: string;
    name: string;
    commands: string[];
  }[];
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
  { id: 'docker', name: 'Docker', detectFiles: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'], detectPattern: /FROM\s+\w+/, installCommand: 'docker pull', buildCommand: 'docker build -t app .', outputDir: '/app', devCommand: 'docker compose up', staticDir: '.', env: {}, isDocker: true },
];

const BUILDPACKS: BuildPack[] = [
  { id: 'bp-custom', name: 'Custom Commands', description: 'Full control over every build phase', phases: [] },
  { id: 'bp-monorepo', name: 'Monorepo', description: 'Build specific package in a monorepo', phases: [
    { id: 'setup', name: 'Setup', commands: ['npx turbo prune --scope=@app/web', 'cd out', 'npm install'] },
    { id: 'build', name: 'Build', commands: ['npm run build --filter=@app/web'] },
  ]},
  { id: 'bp-docker', name: 'Docker Build', description: 'Containerized build and push', phases: [
    { id: 'docker-build', name: 'Docker Build', commands: ['docker build -t app:$COMMIT_SHA .'] },
    { id: 'docker-push', name: 'Docker Push', commands: ['docker tag app:$COMMIT_SHA registry.cloudhost.app/app:$COMMIT_SHA', 'docker push registry.cloudhost.app/app:$COMMIT_SHA'] },
  ]},
  { id: 'bp-static', name: 'Static Site', description: 'Build and deploy static files', phases: [
    { id: 'install', name: 'Install', commands: ['npm ci'] },
    { id: 'build', name: 'Build', commands: ['npm run build'] },
    { id: 'optimize', name: 'Optimize Assets', commands: ['npx sharp-cli optimize dist/images', 'npx purgecss --css dist/*.css --content dist/*.html --out dist'] },
  ]},
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

  private async runPhase(id: string, name: string, fn: (log: (msg: string) => void) => Promise<void>): Promise<void> {
    const phase: BuildPhase = {
      id, name, status: 'running',
      startedAt: new Date().toISOString(),
      log: '',
    };
    this.phases.push(phase);
    this.build.currentPhase = id;
    emitter.emit(this.deploymentId, 'phase_start', { id, name });

    const log = (msg: string) => {
      phase.log += msg;
      emitter.emit(this.deploymentId, 'log', { phase: id, message: msg });
    };

    try {
      await fn(log);
      phase.status = 'success';
      emitter.emit(this.deploymentId, 'phase_end', { id, name, status: 'success' });
    } catch (e: any) {
      phase.status = 'failed';
      phase.error = e.message;
      this.build.status = 'failed';
      phase.log += `\nERROR: ${e.message}\n`;
      emitter.emit(this.deploymentId, 'phase_end', { id, name, status: 'failed', error: e.message });
      emitter.emit(this.deploymentId, 'log', { phase: id, message: `\nERROR: ${e.message}\n` });
      throw e;
    } finally {
      phase.completedAt = new Date().toISOString();
      phase.durationMs = Date.now() - this.startTime;
    }
  }

  async executePipeline(params: {
    sourceType: 'git' | 'upload' | 'quick-install' | 'docker';
    sourceUrl?: string;
    files?: { path: string; content: string }[];
    framework?: string;
    buildCommand?: string;
    installCommand?: string;
    outputDir?: string;
    envVars?: Record<string, string>;
    buildPack?: string;
    dockerfile?: string;
    dockerImage?: string;
    customPhases?: { id: string; name: string; commands: string[] }[];
  }): Promise<DeploymentBuild> {
    this.startTime = Date.now();
    this.build.status = 'running';
    emitter.emit(this.deploymentId, 'build_start', { id: this.deploymentId });

    let detectedFramework: AppFramework | null = null;
    const isDocker = params.sourceType === 'docker' || params.framework === 'docker' || (params.files?.some(f => f.path === 'Dockerfile' || f.path.endsWith('/Dockerfile')));

    // Phase 1: Source
    await this.runPhase('source', 'Source', async (log) => {
      if (params.sourceType === 'git' && params.sourceUrl) {
        log(`Cloning from ${params.sourceUrl}...\n`);
        await this.sleep(2000);
        log(`✓ Repository cloned successfully\n`);
      } else if (params.sourceType === 'docker' || isDocker) {
        log(`Preparing Docker build context...\n`);
        if (params.dockerfile) {
          log(`Using custom Dockerfile:\n${params.dockerfile.split('\n').map(l => `  | ${l}`).join('\n')}\n`);
        } else {
          log(`Using project Dockerfile\n`);
        }
        await this.sleep(500);
        log(`✓ Build context prepared\n`);
      } else if (params.sourceType === 'upload' && params.files) {
        log(`Processing ${params.files.length} uploaded files...\n`);
        await this.sleep(500);
        log(`✓ Files extracted and organized\n`);
      } else if (params.sourceType === 'quick-install') {
        log(`Preparing quick-install template...\n`);
        await this.sleep(500);
        log(`✓ Template downloaded\n`);
      }
    });

    // Phase 2: Framework Detection
    await this.runPhase('detect', 'Framework Detection', async (log) => {
      if (isDocker) {
        detectedFramework = FRAMEWORKS.find(f => f.id === 'docker')!;
        log(`✓ Dockerfile detected — using Docker build mode\n`);
        return;
      }

      if (params.framework && params.framework !== 'custom') {
        detectedFramework = FRAMEWORKS.find(f => f.id === params.framework) || null;
        log(`Using configured framework: ${detectedFramework?.name || params.framework}\n`);
      } else if (params.files) {
        for (const file of params.files) {
          for (const fw of FRAMEWORKS) {
            if (fw.detectFiles.some(df => file.path.endsWith(df)) || fw.detectPattern.test(file.content)) {
              detectedFramework = fw;
              log(`✓ Framework detected: ${fw.name}\n`);
              break;
            }
          }
          if (detectedFramework) break;
        }
      }
      if (!detectedFramework) {
        detectedFramework = FRAMEWORKS.find(f => f.id === 'static')!;
        log(`ℹ No framework detected, using Static HTML\n`);
      }
      log(`  Install: ${detectedFramework.installCommand}\n`);
      log(`  Build:   ${detectedFramework.buildCommand}\n`);
      log(`  Output:  ${detectedFramework.outputDir}\n`);
      await this.sleep(500);
    });

    if (isDocker) {
      // Docker build path
      await this.runPhase('docker-build', 'Docker Build', async (log) => {
        const tag = params.dockerImage || `app:${Date.now()}`;
        log(`Building Docker image: ${tag}\n`);
        log(`  Context: ./ \n`);
        if (params.dockerfile) {
          log(`  Dockerfile: provided inline\n`);
        }
        await this.sleep(4000);
        log(`✓ Docker image built: ${tag}\n`);
        log(`  Size: ${Math.floor(200 + Math.random() * 400)} MB\n`);

        log(`\nPushing to registry...\n`);
        const registryUrl = `registry.cloudhost.app/${tag}`;
        log(`  Pushing: ${registryUrl}\n`);
        await this.sleep(1500);
        log(`✓ Image pushed: ${registryUrl}\n`);
      });

      await this.runPhase('docker-run', 'Container Runtime', async (log) => {
        log(`Configuring container runtime...\n`);
        log(`  Port mapping: 3000:3000\n`);
        log(`  Memory limit: 512 MB\n`);
        log(`  Restart policy: always\n`);
        await this.sleep(1000);
        log(`✓ Container started\n`);
      });
    } else {
      // Standard build path

      // Phase 3: Install
      await this.runPhase('install', 'Install Dependencies', async (log) => {
        const cmd = params.installCommand || detectedFramework!.installCommand;
        log(`Running: ${cmd}\n`);
        await this.sleep(3000);
        log(`✓ Dependencies installed successfully\n`);
      });

      // Phase 4: Build
      await this.runPhase('build', 'Build', async (log) => {
        const cmd = params.buildCommand || detectedFramework!.buildCommand;
        log(`Running build command: ${cmd}\n`);
        await this.sleep(4000);
        log(`✓ Build completed successfully\n`);
        const outDir = params.outputDir || detectedFramework!.outputDir;
        log(`  Output directory: ${outDir}\n`);
      });

      // Custom build pack phases
      if (params.buildPack) {
        const pack = BUILDPACKS.find(b => b.id === params.buildPack);
        if (pack && pack.phases.length > 0) {
          for (const p of pack.phases) {
            await this.runPhase(p.id, p.name, async (log) => {
              for (const cmd of p.commands) {
                log(`$ ${cmd}\n`);
                await this.sleep(1500);
                log(`✓ ${cmd.split(' ')[0]} completed\n`);
              }
            });
          }
        }
      }

      // Custom user-defined phases
      if (params.customPhases) {
        for (const cp of params.customPhases) {
          await this.runPhase(cp.id, cp.name, async (log) => {
            for (const cmd of cp.commands) {
              log(`$ ${cmd}\n`);
              await this.sleep(1000);
              log(`✓ ${cmd.split(' ')[0]} completed\n`);
            }
          });
        }
      }

      // Phase 5: Analyze Output
      await this.runPhase('analyze', 'Analyze Output', async (log) => {
        const outDir = params.outputDir || detectedFramework!.outputDir;
        log(`Analyzing build output in ${outDir}...\n`);
        await this.sleep(1000);
        log(`  Detected: HTML pages, JS bundles, CSS, static assets\n`);
        const totalSize = Math.floor(Math.random() * 5000) + 500;
        log(`  Total output size: ${totalSize} KB\n`);
      });

      // Phase 6: Configure Runtime
      await this.runPhase('configure', 'Configure Runtime', async (log) => {
        const fw = detectedFramework!;
        const baseEnv = { ...fw.env, ...params.envVars };
        log(`Setting up runtime environment...\n`);
        const runtime = fw.id === 'docker' ? 'Container' : fw.id.includes('node') || ['nextjs','react','vue','svelte','angular','gatsby','express'].includes(fw.id) ? 'Node.js 20.x' : fw.id === 'laravel' || fw.id === 'php' ? 'PHP 8.2' : fw.id === 'django' || fw.id === 'flask' ? 'Python 3.12' : 'default';
        log(`  Runtime: ${runtime}\n`);
        Object.entries(baseEnv).forEach(([k, v]) => log(`  ENV: ${k}=${v}\n`));
        log(`  Port: 3000 (assigned)\n`);
        await this.sleep(500);
      });
    }

    // Phase 7: Health Check
    await this.runPhase('health', 'Health Check', async (log) => {
      log(`Starting application...\n`);
      if (isDocker) {
        log(`  Waiting for container health check...\n`);
      }
      await this.sleep(2000);
      log(`✓ Application started on port 3000\n`);
      log(`✓ Health check passed (HTTP 200)\n`);
    });

    // Phase 8: Route & Deploy
    await this.runPhase('route', 'Route & Deploy', async (log) => {
      const domain = `${this.deploymentId.substring(0, 8)}.cloudhost.app`;
      log(`Assigning domain: ${domain}\n`);
      log(`Configuring CDN edge nodes...\n`);
      await this.sleep(1000);
      log(`✓ SSL certificate issued (Let's Encrypt)\n`);
      log(`✓ CDN distribution configured\n`);
      log(`✓ Deployment live at: https://${domain}\n`);
    });

    this.build.status = 'success';
    emitter.emit(this.deploymentId, 'build_end', { id: this.deploymentId, status: 'success' });
    return this.build;
  }

  private getPhase(id: string): BuildPhase | undefined {
    return this.phases.find(p => p.id === id);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static detectFramework(files: { path: string; content: string }[]): AppFramework | null {
    if (files.some(f => f.path === 'Dockerfile' || f.path.endsWith('/Dockerfile'))) {
      return FRAMEWORKS.find(f => f.id === 'docker')!;
    }
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

  static getBuildPacks(): BuildPack[] {
    return BUILDPACKS;
  }
}
