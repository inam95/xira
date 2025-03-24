import { SignUpCard } from "@/features/auth/components/sign-up-card";
import { getCurrent } from "@/features/auth/actions";
import { redirect } from "next/navigation";

export default async function SignUp() {
  const user = await getCurrent();

  if (user) {
    return redirect("/");
  }

  return (
    <div>
      <SignUpCard />
    </div>
  );
}
