"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import tokenService from "@/services/tokenService.ts";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setStep("password");
      setError("");
    } else {
      setError("Por favor, ingresa un correo electrónico válido");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 4) {
      try {
        const response = await login(email, password);
        if (response.token) {
          tokenService.setToken(response.token);
          navigate("/agents");
        } else {
          setError("Credenciales inválidas");
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    } else {
      setError("La contraseña debe ser de al menos 4 caracteres");
    }
  };

  async function login(email: string, pin: string) {
    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-No-Auth": "true",
          },
          body: JSON.stringify({ email, pin }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "La autenticación falló");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center text-2xl">
        <CardTitle>Bienvenido</CardTitle>
        <CardDescription>
          {step === "email" ? "Ingresa tu email" : "Ingresa tu PIN"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={step === "email" ? handleEmailSubmit : handlePasswordSubmit}
        >
          {step === "email" ? (
            <div className="grid w-full items-center gap-4">
              <Input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
              />
            </div>
          ) : (
            <div className="grid w-full items-center gap-4">
              <Input
                type="password"
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Contraseña"
              />
            </div>
          )}
          {error && (
            <p className="text-sm text-red-500 mt-2" role="alert">
              {error}
            </p>
          )}
          <CardFooter className="flex justify-between mt-4 p-0">
            {step === "password" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("email")}
              >
                Volver
              </Button>
            )}
            <Button type="submit" className="ml-auto">
              {step === "email" ? "Siguiente" : "Iniciar sesión"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
