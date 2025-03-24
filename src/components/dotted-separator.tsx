import { cn } from "@/lib/utils";

type DottedSeparatorProps = {
  className?: string;
  color?: string;
  height?: string;
  dotSize?: string;
  dotSpacing?: string;
  orientation?: "horizontal" | "vertical";
};

export function DottedSeparator({
  className,
  color = "var(--dotted-separator-color)",
  height = "2px",
  dotSize = "2px",
  dotSpacing = "6px",
  orientation = "horizontal",
}: DottedSeparatorProps) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      className={cn(
        isHorizontal
          ? "w-full flex items-center"
          : "h-full flex flex-col items-center",
        className
      )}
    >
      <div
        className={isHorizontal ? "flex-grow" : "flex-grow-0"}
        style={{
          width: isHorizontal ? "100%" : height,
          height: isHorizontal ? height : "100%",
          backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
          backgroundSize: isHorizontal
            ? `${parseInt(dotSize) + parseInt(dotSpacing)}px ${height}`
            : `${height} ${parseInt(dotSize) + parseInt(dotSpacing)}px`,
          backgroundRepeat: isHorizontal ? "repeat-x" : "repeat-y",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
