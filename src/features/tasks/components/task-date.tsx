import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";

type TaskDateProps = {
  value: string;
  className?: string;
};

export function TaskDate({ value, className }: TaskDateProps) {
  const today = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, today);

  let textColor = "text-muted-foreground";

  if (diffInDays <= 3) {
    textColor = "text-red-500";
  } else if (diffInDays <= 7) {
    textColor = "text-orange-500";
  } else if (diffInDays <= 14) {
    textColor = "text-yellow-500";
  } else {
    textColor = "text-green-500";
  }

  return (
    <div className={textColor}>
      <div className={cn("truncate", className)}>{format(value, "PPP")}</div>
    </div>
  );
}
