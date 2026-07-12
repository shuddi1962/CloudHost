import { Hono } from "hono";

export const containerServicesRouter = new Hono();

const DO_API = "https://api.digitalocean.com/v2";

const nodeSizeMap: Record<string, string> = {
  light: "s-1vcpu-512mb-10gb",
  standard: "s-1vcpu-1gb",
  plus: "s-1vcpu-2gb",
  pro: "s-2vcpu-4gb",
  max: "s-4vcpu-8gb",
};

const containerServices = new Map<string, any>();

async function doFetch(path: string, options: RequestInit = {}) {
  const token = process.env.DIGITALOCEAN_API_TOKEN;
  if (!token) throw new Error("DIGITALOCEAN_API_TOKEN is not configured");
  const res = await fetch(`${DO_API}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DigitalOcean API error (${res.status}): ${body}`);
  }
  return res.json();
}

function dockerCloudInit(user: string) {
  return `#cloud-config
package_update: true
packages:
  - docker.io
  - docker-compose-plugin
runcmd:
  - systemctl enable docker
  - systemctl start docker
  - usermod -aG docker ${user}
  - curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
  - dpkg -i /tmp/cloudflared.deb || true`;
}

containerServicesRouter.post("/", async (c) => {
  const { name, region, nodeSize, nodeCount } = await c.req.json();

  const doSize = nodeSizeMap[nodeSize] || "s-1vcpu-1gb";
  const svcId = crypto.randomUUID();

  try {
    const data = await doFetch("/droplets", {
      method: "POST",
      body: JSON.stringify({
        name: `${name}-${svcId.slice(0, 8)}`,
        region,
        size: doSize,
        image: "ubuntu-24-04-x64",
        user_data: dockerCloudInit("root"),
        tags: ["cloudhost-container-service", svcId],
      }),
    });

    const droplet = data.droplet;

    containerServices.set(svcId, {
      id: svcId,
      name,
      region,
      nodeSize,
      nodeCount,
      dropletId: droplet.id,
      status: "provisioning",
      droplet,
      createdAt: new Date().toISOString(),
    });

    pollForActive(svcId, droplet.id.toString());

    return c.json({ service: containerServices.get(svcId) }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

async function pollForActive(svcId: string, dropletId: string) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 5000));
    try {
      const data = await doFetch(`/droplets/${dropletId}`);
      const droplet = data.droplet;
      const entry = containerServices.get(svcId);
      if (entry) {
        entry.status = droplet.status === "active" ? "running" : droplet.status;
        entry.droplet = droplet;
        containerServices.set(svcId, entry);
      }
      if (droplet.status === "active") break;
    } catch {
      break;
    }
  }
}

containerServicesRouter.get("/", async (c) => {
  return c.json({ services: Array.from(containerServices.values()) });
});

containerServicesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const svc = containerServices.get(id);
  if (!svc) return c.json({ error: "Container service not found" }, 404);
  return c.json({ service: svc });
});

containerServicesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const svc = containerServices.get(id);
  if (!svc) return c.json({ error: "Container service not found" }, 404);

  try {
    if (svc.dropletId) {
      await doFetch(`/droplets/${svc.dropletId}`, { method: "DELETE" });
    }
    containerServices.delete(id);
    return c.json({ message: "Container service deleted" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
