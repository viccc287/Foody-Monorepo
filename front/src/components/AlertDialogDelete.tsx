// AlertDialogDelete.tsx
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const fetchConfig = () => fetch(import.meta.env.VITE_SERVER_URL + "/config");

interface AlertDialogDeleteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  description?: string;
  requireElevation?: boolean;
}

function AlertDialogDelete({
  open,
  onConfirm,
  onCancel,
  setOpen,
  description = "",
  requireElevation = true,
}: AlertDialogDeleteProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
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
        setPin("");
        setError("");
      } else {
        setError("PIN inválido");
      }
    } else {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setPin("");
    setError("");
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            {description || "Vas a eliminar este elemento"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {requireElevation && (
          <div className="py-4">
            <Input
              type="password"
              placeholder="Ingresa el PIN"
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
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={requireElevation && pin.length !== 4}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertDialogDelete;
