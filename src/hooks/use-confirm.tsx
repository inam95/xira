import { useState, JSX } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UseConfirmProps = {
  title: string;
  message: string;
  variant?: ButtonProps["variant"];
};

export function useConfirm({
  title,
  message,
  variant = "primary",
}: UseConfirmProps): [() => JSX.Element, () => Promise<boolean>] {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    if (promise) {
      promise.resolve(true);
    }
    handleClose();
  };

  const handleCancel = () => {
    if (promise) {
      promise.resolve(false);
    }
    handleClose();
  };

  const ConfirmationDialog = () => {
    return (
      <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
        <Card className="h-full w-full border-none shadow-none">
          <CardContent className="pt-8">
            <CardHeader className="p-0">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{message}</CardDescription>
            </CardHeader>
            <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full lg:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant={variant}
                onClick={handleConfirm}
                className="w-full lg:w-auto"
              >
                Confirm
              </Button>
            </div>
          </CardContent>
        </Card>
      </ResponsiveModal>
    );
  };

  return [ConfirmationDialog, confirm] as const;
}
