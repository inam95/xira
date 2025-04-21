import { TProjectAnalyticsResponse } from "@/features/projects/api/queries";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";

type Props = TProjectAnalyticsResponse;

export function Analytics({ data }: Props) {
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1 min-w-[230px]">
          <AnalyticsCard
            title="Total Tasks"
            value={data.taskCount}
            variant={data.taskDifference > 0 ? "up" : "down"}
            increaseValue={data.taskDifference}
          />
          <DottedSeparator orientation="vertical" />
        </div>
        <div className="flex items-center flex-1 min-w-[230px]">
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.assignedTaskCount}
            variant={data.assignedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskDifference}
          />
          <DottedSeparator orientation="vertical" />
        </div>
        <div className="flex items-center flex-1 min-w-[230px]">
          <AnalyticsCard
            title="Completed Tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.completedTaskDifference}
          />
          <DottedSeparator orientation="vertical" />
        </div>
        <div className="flex items-center flex-1 min-w-[230px]">
          <AnalyticsCard
            title="Overdue Tasks"
            value={data.overDueTaskCount}
            variant={data.overDueTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.overDueTaskDifference}
          />
          <DottedSeparator orientation="vertical" />
        </div>
        <div className="flex items-center flex-1 min-w-[230px]">
          <AnalyticsCard
            title="Incomplete Tasks"
            value={data.inCompleteTaskCount}
            variant={data.inCompleteTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.inCompleteTaskDifference}
          />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
