// AlertDialogDelete.tsx
import { useState } from "react";
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

const VALID_PIN = "1234"; // Should come from environment/config

function AlertDialogDelete({
  open,
  onConfirm,
  onCancel,
  description = "",
  requireElevation = true,
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (requireElevation) {
      if (pin === VALID_PIN) {
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
    <AlertDialog open={open}>
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