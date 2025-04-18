import { memberQueries } from "@/features/members/api/queries";
import { projectsQueries } from "@/features/projects/api/queries";
import { useTaskFilters } from "@/features/tasks/hooks/use-task-filters";
import { TaskStatus } from "@/features/tasks/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { ListCheckIcon, UserIcon } from "lucide-react";
import { DatePicker } from "./date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type DataFiltersProps = {
  hideProjectFilter?: boolean;
};

export function DataFilters({ hideProjectFilter }: DataFiltersProps) {
  const workspaceId = useWorkspaceId();

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

  const isLoading = isProjectsLoading || isMembersLoading;

  const projectOptions = projects?.documents.map((project) => ({
    label: project.name,
    value: project.$id,
  }));

  const memberOptions = members?.documents.map((member) => ({
    label: member.name,
    value: member.$id,
  }));

  const [{ projectId, status, assigneeId, search, dueDate }, setFilters] =
    useTaskFilters();

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatus) });
  };

  const onAssigneeChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : value });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : value });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <Select defaultValue={status ?? "all"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full lg:w-auto !h-8">
          <div className="flex items-center pr-2">
            <ListCheckIcon className="size-4 mr-2" />
            <SelectValue placeholder="All statuses" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
          <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={assigneeId ?? "all"}
        onValueChange={onAssigneeChange}
      >
        <SelectTrigger className="w-full lg:w-auto !h-8">
          <div className="flex items-center pr-2">
            <UserIcon className="size-4 mr-2" />
            <SelectValue placeholder="All assignees" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? "all"}
          onValueChange={onProjectChange}
        >
          <SelectTrigger className="w-full lg:w-auto !h-8">
            <div className="flex items-center pr-2">
              <UserIcon className="size-4 mr-2" />
              <SelectValue placeholder="All assignees" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DatePicker
        placeholder="Due date"
        className="w-full lg:w-auto h-8"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) =>
          setFilters({ dueDate: date ? date.toISOString() : null })
        }
      />
    </div>
  );
}
