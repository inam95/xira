import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useUpdateTask } from "../api/mutations/use-update-task";
import { Task } from "../types";

type Props = {
  task: Task;
};

export function TaskDescription({ task }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description);

  const { mutate: updateTask, isPending } = useUpdateTask();

  const handleUpdateTask = () => {
    updateTask({
      json: {
        description,
      },
      param: {
        taskId: task.$id,
      },
    });

    setIsEditing(false);
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description"
            value={description}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
          <Button
            size="sm"
            className="w-fit ml-auto"
            onClick={handleUpdateTask}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : (
        <div>
          {task.description || (
            <span className="text-sm text-muted-foreground">
              No description set
            </span>
          )}
        </div>
      )}
    </div>
  );
}
