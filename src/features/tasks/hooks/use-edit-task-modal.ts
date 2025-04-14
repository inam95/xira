import { parseAsString, useQueryState } from "nuqs";

export function useEditTaskModal() {
  const [taskId, setTaskId] = useQueryState(
    "edit-task",
    parseAsString.withOptions({
      clearOnDefault: true,
    })
  );

  const open = (taskId: string) => setTaskId(taskId);

  const close = () => setTaskId(null);

  return { taskId, open, close, setTaskId };
}
