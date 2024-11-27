'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [step, setStep] = useState<'email' | 'password'>('email')
    const [error, setError] = useState('')

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return re.test(email)
    }

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateEmail(email)) {
            setStep('password')
            setError('')
        } else {
            setError('Please enter a valid email address')
        }
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length >= 8) {
            // Here you would typically send the login request to your backend
            console.log('Login attempt with:', { email, password })
            setError('')
        } else {
            setError('Password must be at least 8 characters long')
        }
    }

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                    {step === 'email' ? 'Enter your email to get started' : 'Enter your password to continue'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={step === 'email' ? handleEmailSubmit : handlePasswordSubmit}>
                    {step === 'email' ? (
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
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                aria-label="Password"
                            />
                        </div>
                    )}
                    {error && <p className="text-sm text-red-500 mt-2" role="alert">{error}</p>}
                    <CardFooter className="flex justify-between mt-4 p-0">
                        {step === 'password' && (
                            <Button type="button" variant="outline" onClick={() => setStep('email')}>
                                Back
                            </Button>
                        )}
                        <Button type="submit" className="ml-auto">
                            {step === 'email' ? 'Next' : 'Login'}
                        </Button>
                    </CardFooter>
                </form>
            </CardContent>
        </Card>
    )
}

