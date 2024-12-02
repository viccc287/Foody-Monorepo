import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";

const fetchConfig = () => fetch(import.meta.env.VITE_SERVER_URL + "/config");

interface ConfirmActionDialogButtonProps extends ButtonProps {
  title?: string;
  description?: string;
  variant?: ButtonProps["variant"];
  onConfirm: (textValue?: string) => void;
  children: React.ReactNode;
  requireElevation?: boolean;
  requireTextValue?: boolean;
  textValuePlaceholder?: string;
  initialTextValue?: string;
}

function ConfirmActionDialogButton({
  title = "¿Estás seguro?",
  description,
  onConfirm,
  children,
  variant = "default",
  requireElevation = false,
  requireTextValue = false,
  textValuePlaceholder = "Ingresa el texto requerido",
  initialTextValue = "",
  ...props
}: ConfirmActionDialogButtonProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [validPin, setValidPin] = useState("");
  const [textValue, setTextValue] = useState(initialTextValue);

  useEffect(() => {
    if (requireElevation) {
      fetchConfig()
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              setValidPin(data.securityPin);
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching config", error);
        });
    }
  }, [requireElevation]);

  const handleConfirm = () => {
    if (requireElevation) {
      if (pin === validPin) {
        onConfirm(requireTextValue ? textValue : undefined);
        setOpen(false);
        setPin("");
        setError("");
        setTextValue("");
      } else {
        setError("PIN inválido");
      }
    } else {
      setOpen(false);
      onConfirm(requireTextValue ? textValue : undefined);
      setTextValue("");
    }
  };

  const handleCancel = () => {
    setPin("");
    setError("");
    setTextValue("");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} {...props}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requireTextValue && (
          <div className="py-1 flex flex-col gap-2 justify-center">
            <Label htmlFor="textValue" className="text-muted-foreground">
              {textValuePlaceholder}
            </Label>
            <Input
              id="textValue"
              type="text"
              placeholder={textValuePlaceholder}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />
          </div>
        )}
        {requireElevation && (
          <div className="py-1 flex flex-col gap-2 justify-center">
            <Label htmlFor="securityPin" className="text-muted-foreground">
              Ingresa el PIN de seguridad
            </Label>

            <Input
              id='securityPin'
              type="password"
              placeholder="Ingresa el PIN de seguridad"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              maxLength={4}
              className={cn(error ? "border-red-500" : "", "w-fit")}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={
              (requireTextValue && textValue.trim() === "") ||
              (requireElevation && pin.length !== 4)
            }
            variant={variant}
          >
            Continuar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmActionDialogButton;
