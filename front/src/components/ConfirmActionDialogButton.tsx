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
import { useEffect, useState } from "react";

const fetchConfig = () => fetch(import.meta.env.VITE_SERVER_URL + "/config");

interface ConfirmActionDialogButtonProps extends ButtonProps {
  title?: string;
  description?: string;
  variant?: ButtonProps["variant"];
  onConfirm: () => void;
  children: React.ReactNode;
  requireElevation?: boolean;
}

function ConfirmActionDialogButton({
  title = "¿Estás seguro?",
  description,
  onConfirm,
  children,
  variant = "default",
  requireElevation = false,
  ...props
}: ConfirmActionDialogButtonProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [validPin, setValidPin] = useState("");

  useEffect(() => {
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
  }, []);

  const handleConfirm = () => {
    if (requireElevation) {
      if (pin === validPin) {
        onConfirm();
        setOpen(false);
        setPin("");
        setError("");
      } else {
        setError("PIN inválido");
      }
    } else {
      setOpen(false);
      onConfirm();
    }
  };

  const handleCancel = () => {
    setPin("");
    setError("");
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
        {requireElevation && (
          <div className="py-4">
            <Input
              type="password"
              placeholder="Ingresa el PIN de seguridad"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              maxLength={4}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={requireElevation && pin.length !== 4}
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
