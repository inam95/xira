"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { memberQueries } from "@/features/members/api/queries";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  MoreVerticalIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMember } from "@/features/members/api/mutations/use-delete-member";
import { useUpdateMember } from "@/features/members/api/mutations/use-update-member";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { Skeleton } from "@/components/ui/skeleton";

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="size-8 rounded-md ml-auto" />
    </div>
  );
}

export function MembersList() {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Remove member",
    message: "Are you sure you want to remove this member?",
    variant: "destructive",
  });

  const { data: members, isLoading } = useQuery({
    ...memberQueries.listByWorkspaceId({ workspaceId }),
  });

  const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();

  const handleRemoveMember = async (memberId: string) => {
    const confirmed = await confirm();

    if (!confirmed) return;

    deleteMember({
      param: {
        memberId,
      },
    });
  };

  const handleUpdateMember = async (memberId: string, role: MemberRole) => {
    updateMember({
      param: {
        memberId,
      },
      json: {
        role,
      },
    });
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button variant="secondary" size="sm" asChild>
          <Link href={`${pathname}/members`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            <span>Back</span>
          </Link>
        </Button>
        <CardTitle className="text-lg font-bold">Members</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <MemberSkeleton />
              <Separator className="my-2.5" />
              <MemberSkeleton />
              <Separator className="my-2.5" />
              <MemberSkeleton />
            </>
          ) : (
            members?.documents.map((member, index) => (
              <Fragment key={member.$id}>
                <div className="flex items-center gap-2">
                  <MemberAvatar
                    className="size-10"
                    fallbackClassName="text-lg"
                    name={member.name}
                  />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="ml-auto"
                      >
                        <MoreVerticalIcon className="size-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() => handleUpdateMember(member.$id, "ADMIN")}
                        disabled={isUpdating}
                      >
                        <ShieldCheckIcon className="size-4 mr-2" />
                        <span>Set as administrator</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() => handleUpdateMember(member.$id, "MEMBER")}
                        disabled={isUpdating}
                      >
                        <ShieldCheckIcon className="size-4 mr-2" />
                        <span>Set as member</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="font-medium text-amber-700"
                        onClick={() => handleRemoveMember(member.$id)}
                        disabled={isDeleting}
                      >
                        <TrashIcon className="size-4 mr-2" />
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {index < members.documents.length - 1 && (
                  <Separator className="my-2.5" />
                )}
              </Fragment>
            ))
          )}
        </div>
      </CardContent>
      <ConfirmDialog />
    </Card>
  );
}
