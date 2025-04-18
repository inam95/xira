import { AlertTriangle } from "lucide-react";

type Props = {
  message: string;
};

export function PageError({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertTriangle className="size-6 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
