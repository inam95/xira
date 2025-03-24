import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { signInSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()
  .get("/current", sessionMiddleware, async (c) => {
    const user = c.get("user");

    return c.json({ data: user });
  })
  .post("/login", zValidator("json", signInSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, AUTH_COOKIE_OPTIONS);

    return c.json({ success: true });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");
    const { account } = await createAdminClient();

    await account.create(ID.unique(), email, password, name);

    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, AUTH_COOKIE_OPTIONS);

    return c.json({ success: true });
  })
  .post("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");

    await account.deleteSession("current");
    deleteCookie(c, AUTH_COOKIE);

    return c.json({ success: true });
  });
export default app;
