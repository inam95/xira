import "server-only";

import { getCookie } from "hono/cookie";
import {
  Account,
  Client,
  Databases,
  Models,
  Storage,
  type Account as AppwriteAccount,
  type Databases as AppwriteDatabases,
  type Users as AppwriteUsers,
  type Storage as AppwriteStorage,
} from "node-appwrite";
import { createMiddleware } from "hono/factory";
import { AUTH_COOKIE } from "@/features/auth/constants";

type SessionMiddlewareContext = {
  Variables: {
    account: AppwriteAccount;
    databases: AppwriteDatabases;
    storage: AppwriteStorage;
    users: AppwriteUsers;
    user: Models.User<Models.Preferences>;
  };
};

export const sessionMiddleware = createMiddleware<SessionMiddlewareContext>(
  async (c, next) => {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const session = getCookie(c, AUTH_COOKIE);

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    client.setSession(session);

    const account = new Account(client);
    const databases = new Databases(client);
    const storage = new Storage(client);

    const user = await account.get();

    c.set("account", account);
    c.set("databases", databases);
    c.set("storage", storage);
    c.set("user", user);

    await next();
  }
);
