"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-y-4">
      <AlertTriangle className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Something went wrong. Please try again.
      </p>
      <Button variant="secondary" asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
