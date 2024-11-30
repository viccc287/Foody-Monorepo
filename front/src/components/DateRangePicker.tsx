import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { HTMLAttributes, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Badge } from "./ui/badge";

const presets = [
  {
    label: "Hoy",
    getValue: () => {
      const today = new Date();
      return {
        from: startOfDay(today), // Sets time to 00:00:00
        to: endOfDay(today), // Sets time to 23:59:59
      };
    },
  },
  {
    label: "Ayer",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        from: startOfDay(yesterday), // Sets time to 00:00:00
        to: endOfDay(yesterday), // Sets time to 23:59:59
      };
    },
  },
  {
    label: "Últimos 7 días",
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 15 días",
    getValue: () => ({
      from: subDays(new Date(), 15),
      to: new Date(),
    }),
  },
];
export function DateRangePicker({
  className,
  onDateRangeChange,
}: HTMLAttributes<HTMLDivElement> & {
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}) {
  const today = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(today),
    to: endOfDay(today),
  });

  const [presetName, setPresetName] = useState<string | null>('Hoy');

  useEffect(() => {
    onDateRangeChange(date);
  }, [date, onDateRangeChange]);

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-fit justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/y", { locale: es })} -{" "}
                  {format(date.to, "dd/MM/y", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/y", { locale: es })
              )
            ) : (
              <span>Seleccionar fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="flex flex-col gap-2 p-3 border-r">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() => {
                    setDate(preset.getValue());
                    setPresetName(preset.label);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setPresetName(null);
                }}
                numberOfMonths={2}
                locale={es}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Badge className="bg-blue-600">{presetName || "Personalizado"}</Badge>
    </div>
  );
}
