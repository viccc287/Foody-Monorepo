import LoginForm from "@/components/LoginForm.tsx";

export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-8">Foody</h1>
            <LoginForm />
        </div>
    )
}

