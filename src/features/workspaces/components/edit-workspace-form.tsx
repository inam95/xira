"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkspaceSchema } from "../schemas";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon, ArrowLeftIcon, CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUpdateWorkspace } from "../api/mutations/use-update-workspace";
import { Workspace } from "../types";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/mutations/use-delete-workspace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/mutations/use-reset-invite-code";

type EditWorkspaceFormProps = {
  onCancel?: () => void;
  initialValues: Workspace;
};

export function EditWorkspaceForm({
  onCancel,
  initialValues,
}: EditWorkspaceFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateWorkspace, isPending } = useUpdateWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspace();
  const { mutate: resetInviteCode, isPending: isResettingInviteCode } =
    useResetInviteCode();
  const [DeleteWorkspaceDialog, confirmDeleteWorkspace] = useConfirm({
    title: "Delete Workspace",
    message: "Are you sure you want to delete this workspace?",
    variant: "destructive",
  });
  const [ResetInviteCodeDialog, confirmResetInviteCode] = useConfirm({
    title: "Reset Invite Link",
    message:
      "Are you sure you want to reset the invite link? This will invalidate the current link and generate a new one.",
    variant: "destructive",
  });

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.image ?? "",
    },
  });

  const onSubmit = (data: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...data,
      image: data.image instanceof File ? data.image : "",
    };

    updateWorkspace({
      form: finalValues,
      param: { workspaceId: initialValues.$id },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const handleDeleteWorkspace = async () => {
    const confirmed = await confirmDeleteWorkspace();

    if (!confirmed) return;

    deleteWorkspace(
      { param: { workspaceId: initialValues.$id } },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  const handleResetInviteCode = async () => {
    const confirmed = await confirmResetInviteCode();

    if (!confirmed) return;

    resetInviteCode({ param: { workspaceId: initialValues.$id } });
  };

  const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteLink).then(() => {
      toast.success("Invite link copied to clipboard");
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={
              onCancel
                ? onCancel
                : () => router.push(`/workspaces/${initialValues.$id}`)
            }
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
          </CardTitle>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter workspace name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center gap-x-5">
                        {field.value ? (
                          <div className="relative size-[72px] rounded-md overflow-hidden">
                            <Image
                              src={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : field.value
                              }
                              alt="Workspace image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar className="size-[72px]">
                            <AvatarFallback>
                              <ImageIcon className="size-[36px] text-neutral-400" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm">Workspace Icon</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, SVG, or JPEG, max 1MB
                          </p>
                          <input
                            className="hidden"
                            type="file"
                            accept=".jpg, .png, .svg, .jpeg"
                            ref={inputRef}
                            disabled={isPending || isDeleting}
                            onChange={(e) => {
                              handleImageChange(e);
                            }}
                          />
                          {field.value ? (
                            <Button
                              type="button"
                              variant="destructive"
                              disabled={isPending}
                              size="xs"
                              className="w-fit mt-2"
                              onClick={() => {
                                field.onChange(null);
                                if (inputRef.current) {
                                  inputRef.current.value = "";
                                }
                              }}
                            >
                              Remove Image
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isPending}
                              size="xs"
                              className="w-fit mt-2"
                              onClick={() => inputRef.current?.click()}
                            >
                              Upload Image
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              <DottedSeparator className="py-7" />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  size="lg"
                  disabled={isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="w-full h-full border-none shadow-none ">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Invite Members</h3>
            <p className="text-sm text-muted-foreground">
              Use the link below to invite members to your workspace.
            </p>
            <div className="mt-4">
              <div className="flex items-center gap-x-2">
                <Input type="text" value={fullInviteLink} readOnly />
                <Button
                  type="button"
                  className="size-12"
                  variant="secondary"
                  onClick={handleCopyInviteLink}
                >
                  <CopyIcon className="size-5" />
                </Button>
              </div>
            </div>
            <DottedSeparator className="py-7" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-6 w-fit ml-auto"
              disabled={isResettingInviteCode}
              onClick={handleResetInviteCode}
            >
              Reset Invite Link
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full h-full border-none shadow-none ">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting this workspace will remove it from your account and all
              associated data. This action is irreversible.
            </p>
            <DottedSeparator className="py-7" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-6 w-fit ml-auto"
              disabled={isDeleting}
              onClick={handleDeleteWorkspace}
            >
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
      <DeleteWorkspaceDialog />
      <ResetInviteCodeDialog />
    </div>
  );
}
