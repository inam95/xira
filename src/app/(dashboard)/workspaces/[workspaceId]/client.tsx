"use client";

import { Analytics } from "@/components/analytics";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { memberQueries } from "@/features/members/api/queries";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Member } from "@/features/members/types";
import { projectsQueries } from "@/features/projects/api/queries";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { Project } from "@/features/projects/types";
import { tasksQueries } from "@/features/tasks/api/queries";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { workspaceQueries } from "@/features/workspaces/api/queries";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  workspaceId: string;
};

export function WorkspaceIdClient({ workspaceId }: Props) {
  const { data: workspaceAnalytics, isLoading: isWorkspaceAnalyticsLoading } =
    useQuery({
      ...workspaceQueries.workspaceAnalytics({ workspaceId }),
    });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    ...tasksQueries.filteredList({
      workspaceId,
    }),
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    ...projectsQueries.listByWorkspace({
      workspaceId,
    }),
  });

  const { data: members, isLoading: isMembersLoading } = useQuery({
    ...memberQueries.listByWorkspaceId({
      workspaceId,
    }),
  });

  const isLoading =
    isWorkspaceAnalyticsLoading ||
    isTasksLoading ||
    isProjectsLoading ||
    isMembersLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!workspaceAnalytics || !tasks || !projects || !members) {
    return <PageError message="Failed to fetch data" />;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Analytics data={workspaceAnalytics} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TasksList
          tasks={tasks.data.documents}
          total={tasks.data.total}
          workspaceId={workspaceId}
        />
        <ProjectsList
          projects={projects.documents}
          total={projects.total}
          workspaceId={workspaceId}
        />
        <MembersList
          members={members.documents}
          total={members.total}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}

type TaskListProps = {
  tasks: Task[];
  total: number;
  workspaceId: string;
};

function TasksList({ tasks, total, workspaceId }: TaskListProps) {
  const { open: openCreateTaskModal } = useCreateTaskModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tasks ({total})</p>
          <Button variant="muted" size="icon" onClick={openCreateTaskModal}>
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {tasks.map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4">
                    <p className="text-lg font-medium truncate">{task.name}</p>
                    <div className="flex items-center gap-x-2">
                      <p className="text-sm text-neutral-400">
                        {task.project?.name}
                      </p>
                      <div className="size-1 bg-neutral-300 rounded-full" />
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="size-4 mr-1" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No tasks found
          </li>
        </ul>
        <Button variant="muted" className="w-full mt-4" asChild>
          <Link href={`/workspaces/${workspaceId}/tasks`}>Show All</Link>
        </Button>
      </div>
    </div>
  );
}

type ProjectListProps = {
  projects: Project[];
  total: number;
  workspaceId: string;
};

function ProjectsList({ projects, total, workspaceId }: ProjectListProps) {
  const { open: openCreateProjectModal } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects ({total})</p>
          <Button
            variant="secondary"
            size="icon"
            onClick={openCreateProjectModal}
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project) => (
            <li key={project.$id}>
              <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4 flex items-center gap-x-2.5">
                    <ProjectAvatar
                      name={project.name}
                      image={project.image}
                      fallbackClassName="text-lg"
                      className="size-12"
                    />

                    <p className="text-lg font-medium truncate">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No projects found
          </li>
        </ul>
      </div>
    </div>
  );
}

type MemberListProps = {
  members: Member[];
  total: number;
  workspaceId: string;
};

function MembersList({ members, total, workspaceId }: MemberListProps) {
  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members ({total})</p>
          <Button variant="secondary" size="icon" asChild>
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <li key={member.$id}>
              <Card className="shadow-none rounded-lg overflow-hidden">
                <CardContent className="p-3 flex flex-col items-center gap-x-2.5">
                  <MemberAvatar name={member.name} className="size-12" />

                  <div className="flex flex-col items-center overflow-hidden">
                    <p className="text-lg font-medium line-clamp-1">
                      {member.name}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {member.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No members found
          </li>
        </ul>
      </div>
    </div>
  );
}
