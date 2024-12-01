import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export const useAlert = () => {
  const { toast } = useToast();

  const alert = useCallback(
    (
      title: string,
      description: React.ReactNode,
      status: "error" | "warning" | "default" = "default"
    ) =>
      toast({
        title,
        description,
        variant:
          status === "error"
            ? "destructive"
            : status === "warning"
            ? "warning"
            : "default",
      }),
    [toast]
  );

  return { alert };
};
