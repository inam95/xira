import { getCurrent } from "@/features/auth/actions";
import { redirect } from "next/navigation";

export default async function WorkspacePage() {
  const user = await getCurrent();

  if (!user) {
    return redirect("/sign-in");
  }
  return <div>WorkspacePage</div>;
}
