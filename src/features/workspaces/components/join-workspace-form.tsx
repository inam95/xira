"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useJoinWorkspace } from "../api/mutations/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";

type JoinWorkspaceFormProps = {
  initialValues: {
    name: string;
  };
};

export function JoinWorkspaceForm({ initialValues }: JoinWorkspaceFormProps) {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const { mutate: joinWorkspace, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    joinWorkspace(
      {
        param: { workspaceId },
        json: { code: inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle>Join Workspace</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong>
          . Please enter the code below to join
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
          <Button
            variant="secondary"
            type="button"
            asChild
            size="lg"
            className="w-full lg:w-fit"
            disabled={isPending}
          >
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            size="lg"
            className="w-full lg:w-fit"
            type="button"
            onClick={onSubmit}
            disabled={isPending}
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
