import { Hono } from "hono";
import { db, projects } from "@cloudhost/db";

export const vpsRouter = new Hono();

const DO_API = "https://api.digitalocean.com/v2";

const blueprintImageMap: Record<string, string> = {
  "wordpress": "wordpress-24-04",
  "lamp stack": "lamp-24-04",
  "node.js": "nodejs-24-04",
  "ghost": "ghost-24-04",
  "gitlab ce": "gitlab-24-04",
  "nginx": "nginx-24-04",
  "joomla": "joomla-24-04",
  "drupal": "drupal-24-04",
  "mean stack": "mean-24-04",
  "plesk": "plesk-24-04",
};

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

const dropletStore = new Map<string, any>();

vpsRouter.post("/", async (c) => {
  const { name, plan, region, blueprint, platform } = await c.req.json();

  let imageSlug = blueprintImageMap[blueprint.toLowerCase()];
  if (!imageSlug) {
    const baseOsMap: Record<string, string> = {
      "ubuntu": "ubuntu-24-04-x64",
      "debian": "debian-12-x64",
      "almalinux": "almalinux-9-x64",
      "rocky linux": "rocky-linux-9-x64",
      "fedora": "fedora-41-x64",
    };
    imageSlug = baseOsMap[blueprint.toLowerCase()] || "ubuntu-24-04-x64";
  }

  try {
    const data = await doFetch("/droplets", {
      method: "POST",
      body: JSON.stringify({
        name,
        region,
        size: plan,
        image: imageSlug,
        tags: [`cloudhost-${platform}`],
      }),
    });

    const droplet = data.droplet;
    dropletStore.set(droplet.id.toString(), { ...droplet, status: "provisioning" });

    pollForIp(droplet.id.toString());

    return c.json({ droplet, status: "provisioning" }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

async function pollForIp(dropletId: string) {
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    try {
      const data = await doFetch(`/droplets/${dropletId}`);
      const droplet = data.droplet;
      const publicIp = droplet.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;
      dropletStore.set(dropletId, {
        ...droplet,
        status: droplet.status,
        ip: publicIp || null,
      });
      if (droplet.status === "active" && publicIp) break;
    } catch {
      break;
    }
  }
}

vpsRouter.get("/", async (c) => {
  const droplets = Array.from(dropletStore.values());
  return c.json({ servers: droplets });
});

vpsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const local = dropletStore.get(id);
  if (local) return c.json({ droplet: local });
  try {
    const data = await doFetch(`/droplets/${id}`);
    return c.json({ droplet: data.droplet });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

vpsRouter.post("/:id/action", async (c) => {
  const id = c.req.param("id");
  const { action } = await c.req.json();
  const actionMap: Record<string, string> = {
    start: "power_on",
    stop: "power_off",
    restart: "reboot",
    rebuild: "rebuild",
  };
  const doAction = actionMap[action];
  if (!doAction) return c.json({ error: "Unknown action" }, 400);
  try {
    await doFetch(`/droplets/${id}/actions`, {
      method: "POST",
      body: JSON.stringify({ type: doAction }),
    });
    return c.json({ message: `Action '${action}' executed`, dropletId: id });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

vpsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await doFetch(`/droplets/${id}`, { method: "DELETE" });
    dropletStore.delete(id);
    return c.json({ message: "Droplet deleted" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
