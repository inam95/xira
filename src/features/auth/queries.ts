"use server";

import { createSessionClient } from "@/lib/appwrite";

export async function getCurrent() {
  try {
    const { account } = await createSessionClient();

    const user = await account.get();

    return user;
  } catch {
    return null;
  }
}
