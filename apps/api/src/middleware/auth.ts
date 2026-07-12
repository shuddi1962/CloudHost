import { verify, sign } from "hono/jwt";
import { getCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";

const JWT_SECRET = process.env.JWT_SECRET!;

export const jwtAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : getCookie(c, "token");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    c.set("jwtPayload", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
};

export { sign };
