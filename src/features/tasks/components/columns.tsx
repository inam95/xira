"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "./task-actions";
export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          Task Name
          <ArrowUpDown className="size-4 ml-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.name;
      return <p className="line-clamp-1">{name}</p>;
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          Project
          <ArrowUpDown className="size-4 ml-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original.project;
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <ProjectAvatar
            name={project.name}
            image={project.image}
            className="size-6"
          />
          <p className="line-clamp-1">{project.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          Assignee
          <ArrowUpDown className="size-4 ml-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <MemberAvatar
            name={assignee.name}
            className="size-6"
            fallbackClassName="text-xs"
          />
          <p className="line-clamp-1">{assignee.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          Due Date
          <ArrowUpDown className="size-4 ml-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      return <TaskDate value={dueDate} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          Status
          <ArrowUpDown className="size-4 ml-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>;
    },
  },
  {
    accessorKey: "actions",
    header: () => null,
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.project.$id;
      return (
        <TaskActions id={id} projectId={projectId}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];

export type TaskColumns = typeof columns;
