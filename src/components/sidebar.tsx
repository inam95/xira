import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
export function Sidebar() {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="logo" width={100} height={80} />
      </Link>
      <DottedSeparator className="my-4" />
      <Navigation />
    </aside>
  );
}
