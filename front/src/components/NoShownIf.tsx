import { CircleSlash } from "lucide-react";
import { Card } from "./ui/card";

export default function NoShownIf({
  condition,
  children,
  message,
}: {
  condition: boolean;
  children: React.ReactNode;
  message?: string;
}) {
  return condition ? (
    <Card className="flex  items-center justify-center h-full p-4 gap-2 text-muted-foreground text-sm">
      <CircleSlash size={16} /> {message || "No hay datos para mostrar"}
      <h2 className="text-md font-medium  mb-2"></h2>
    </Card>
  ) : (
    <>{children}</>
  );
}
